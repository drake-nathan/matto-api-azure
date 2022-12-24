import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Connection } from 'mongoose';
import { getProject } from '../src/db/queries/projectQueries';
import { connectionFactory } from '../src/db/connectionFactory';
import { getScriptInputsFromDb } from '../src/db/queries/tokenQueries';
import { getHtml } from '../src/helpers/generatorHelpers';

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest,
): Promise<void> => {
  const { project_slug, token_id } = context.bindingData;
  let conn: Connection;

  try {
    conn = await connectionFactory(context);

    const project = await getProject(project_slug, conn);

    if (!project) {
      context.res = {
        status: 404,
        body: 'Project not found.',
      };
      return;
    }

    const { project_name, gen_script } = project;

    let scriptInputs: string;

    if (req.body && req.body.scriptInputs) {
      scriptInputs = JSON.stringify(req.body.scriptInputs);
      context.log.info(
        `Using scriptInputs from request body for token ${token_id} on ${project_name}.`,
      );
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

    const isMathare = project_slug === 'mathare-memories';
    const generatorHtml = getHtml(project_name, gen_script, scriptInputs, isMathare);
    // const generatorHtml = getHtml(
    //   'Mathare',
    //   'https://cdn.gengames.io/scripts/mathare/mathareMemories.min.js',
    //   JSON.stringify({ token_id, transfer_count: 0 }),
    //   true,
    // );

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
