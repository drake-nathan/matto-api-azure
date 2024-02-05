import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { getProject } from "../src/db/queries/projectQueries";
import { getScriptInputsFromDb } from "../src/db/queries/tokenQueries";
import { isNumber, isProjectSlug } from "../src/utils/typeChecks";
import { getHtml, getScriptType } from "./helpers";

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest,
): Promise<void> => {
  const { project_slug, token_id } = context.bindingData;
  let conn: Connection | undefined;

  if (!isProjectSlug(project_slug)) {
    context.res = {
      body: "Invalid project slug.",
      status: 404,
    };
    return;
  }

  if (!isNumber(token_id)) {
    context.res = {
      body: "Invalid token id.",
      status: 404,
    };
    return;
  }

  try {
    conn = await connectionFactory(context);

    const project = await getProject(project_slug, conn);

    if (!project) {
      context.res = {
        body: "Project not found.",
        status: 404,
      };
      return;
    }

    const { gen_scripts, project_name } = project;

    if (!gen_scripts) {
      context.res = {
        body: "This project does not have a generator.",
        status: 404,
      };
      return;
    }

    let scriptInputsJson: string;

    if (req.body?.scriptInputs) {
      scriptInputsJson = JSON.stringify(req.body.scriptInputs);
      context.log.info(
        `Using scriptInputs from request body for token ${token_id} on ${project_name}.`,
      );
    } else {
      const scriptInputsDb = await getScriptInputsFromDb(
        project_slug,
        token_id,
        conn,
      );

      if (!scriptInputsDb) {
        context.res = {
          body: "This token may not be minted yet.",
          status: 404,
        };
        return;
      }

      scriptInputsJson = JSON.stringify(scriptInputsDb);
    }

    if (!scriptInputsJson) {
      context.res = {
        body: "Something went wrong, ngmi.",
        status: 400,
      };
      return;
    }

    const genOptions = {
      mobile: false,
      scriptType: getScriptType(
        project_slug,
        gen_scripts,
        scriptInputsJson,
        req,
      ),
    };

    // adds mobile controls script if query param ?mobile=true
    if (req.query.mobile && req.query.mobile === "true")
      genOptions.mobile = true;

    const generatorHtml = getHtml(
      project_name,
      gen_scripts,
      scriptInputsJson,
      genOptions,
    );

    context.res = {
      body: generatorHtml,
      headers: {
        "Content-Type": "text/html",
      },
      status: 200,
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      body: "Something went wrong, ngmi.",
      status: 500,
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default httpTrigger;
