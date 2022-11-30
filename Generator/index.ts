import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Connection } from 'mongoose';
import { checkIfProjectExists } from '../src/db/queries/projectQueries';
import { connectionFactory } from '../src/db/connectionFactory';
import { getScriptInputsFromDb } from '../src/db/queries/tokenQueries';

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest,
): Promise<void> => {
  const { project_slug, token_id } = context.bindingData;
  let conn: Connection;

  try {
    conn = await connectionFactory(context);

    const project = await checkIfProjectExists(project_slug, conn);

    if (!project) {
      context.res = {
        status: 404,
        body: 'Project not found.',
      };
      return;
    }

    let scriptInputs: string;

    if (req.body && req.body.scriptInputs) {
      scriptInputs = JSON.stringify(req.body.scriptInputs);
      context.log.info('Using scriptInputs from request body.');
    } else {
      const scriptInputsDb = await getScriptInputsFromDb(project_slug, token_id, conn);

      if (!scriptInputsDb) {
        context.res = {
          status: 404,
          body: 'This token may not be minted yet.',
        };
        return;
      }

      scriptInputs = JSON.stringify(scriptInputsDb);
    }

    if (!scriptInputs) {
      context.res = {
        status: 400,
        body: 'Something went wrong, ngmi.',
      };
      return;
    }

    const generatorHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
          <title>Chainlife</title>
      
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
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
        </head>
        <body>
          <div id="canvas-container"></div>
          <script>const scriptInputs = ${scriptInputs};</script>
          <script src="https://cdn.gengames.io/scripts/chainlife/chainlifeToken.min.js"></script>
        </body>
      </html>
  `;

    context.res = {
      status: 200,
      body: generatorHtml,
      headers: {
        'Content-Type': 'text/html',
      },
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: 'Something went wrong, ngmi.',
    };
  } finally {
    await conn.close();
  }
};

export default httpTrigger;
