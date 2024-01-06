import { AzureFunction, Context } from "@azure/functions";
import { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { checkIfProjectExists } from "../src/db/queries/projectQueries";
import { getLevels } from "../src/db/queries/tokenQueries";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { project_slug } = context.bindingData;
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const project = await checkIfProjectExists(project_slug, conn);

    if (!project) {
      context.res = {
        body: "Project not found.",
        status: 404,
      };
      return;
    }

    const levelsArray = await getLevels(project_slug, conn);

    const generatorHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
          <title>Chainlife World Generator</title>
      
          <style type="text/css" id="Chainlife Generator">
            body {
              margin: 0;
              padding: 0;
            }
          
            canvas {
              padding: 0;
              margin: auto;
              display: block;
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
          </head>
          <body>
          <div id="canvas-container"></div>
          <script>const levelsArray = ${JSON.stringify(levelsArray)};</script>
          <script src="https://cdn.substratum.art/scripts/chainlife/chainlifeWorld.min.js"></script>
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
