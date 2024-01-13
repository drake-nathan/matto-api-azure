import type { AzureFunction, Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { checkIfTokenExists, getSvg } from "../src/db/queries/tokenQueries";
import { deEscapeSvg } from "../src/utils/deEscapeSvg";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { project_slug, token_id } = context.bindingData;
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const doesTokenExist = await checkIfTokenExists(
      token_id,
      project_slug,
      conn,
    );
    if (!doesTokenExist) {
      context.res = {
        body: "Token does not exist. It may not have been minted yet.",
        status: 404,
      };
      return;
    }

    const svg = await getSvg(conn, project_slug, token_id);

    if (!svg) {
      context.res = {
        body: "Could not fetch SVG for this token, or an SVG does not exist on this token.",
        status: 404,
      };
      return;
    }

    const generatorHtml = /* html */ `
      <!DOCTYPE html>
      <html>
        <body>
          ${deEscapeSvg(svg)}
        </body>
      </html>
    `;

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
