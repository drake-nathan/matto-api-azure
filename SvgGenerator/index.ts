import type { AzureFunction, Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { checkIfTokenExists, getSvg } from "../src/db/queries/tokenQueries";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { project_slug, token_id } = context.bindingData;
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const textureSlug = "texture-and-hues";

    if (project_slug !== textureSlug) {
      context.res = {
        status: 404,
        body: "Currently only supporting Texture and Hues.",
      };
      return;
    }

    const doesTokenExist = await checkIfTokenExists(
      token_id,
      project_slug,
      conn,
    );
    if (!doesTokenExist) {
      context.res = {
        status: 404,
        body: "Token does not exist. It may not have been minted yet.",
      };
      return;
    }

    const svg = await getSvg(conn, project_slug, token_id);

    if (!svg) {
      context.res = {
        status: 404,
        body: "Could not fetch SVG for this token.",
      };
      return;
    }

    const generatorHtml = /* html */ `
      <!DOCTYPE html>
      <html>
        <body>
          ${svg}
        </body>
      </html>
    `;

    context.res = {
      status: 200,
      body: generatorHtml,
      headers: {
        "Content-Type": "text/html",
      },
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      status: 500,
      body: "Something went wrong, ngmi.",
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default httpTrigger;
