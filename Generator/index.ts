import type { AzureFunction, Context, HttpRequest } from '@azure/functions';
import type { Connection } from 'mongoose';
import { getProject } from '../src/db/queries/projectQueries';
import { connectionFactory } from '../src/db/connectionFactory';
import { getScriptInputsFromDb } from '../src/db/queries/tokenQueries';
import { altScriptCheck, getHtml } from './helpers';

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

    const { project_name, gen_scripts } = project;

    let scriptInputsJson: string;
    let usingScriptInputsFromBody = false;
    // will be true when puppeteer is running snapshot

    if (req.body && req.body.scriptInputs) {
      scriptInputsJson = JSON.stringify(req.body.scriptInputs);
      usingScriptInputsFromBody = true;
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

      scriptInputsJson = JSON.stringify(scriptInputsDb);
    }

    if (!scriptInputsJson) {
      context.res = {
        status: 400,
        body: 'Something went wrong, ngmi.',
      };
      return;
    }

    // disables alt script for puppeteer, otherwise will run alt check
    const alt = usingScriptInputsFromBody
      ? false
      : altScriptCheck(project_slug, gen_scripts, scriptInputsJson, req);
    const genOptions = {
      mobile: false,
      alt,
    };

    // adds mobile controls script if query param ?mobile=true
    if (req.query?.mobile && req.query.mobile === 'true') genOptions.mobile = true;

    const generatorHtml = getHtml(
      project_name,
      gen_scripts,
      scriptInputsJson,
      genOptions,
    );

    context.res = {
      status: 200,
      body: generatorHtml,
      headers: {
        'Content-Type': 'text/html',
      },
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === 'test') console.error(error);
    context.res = {
      status: 500,
      body: 'Something went wrong, ngmi.',
    };
  } finally {
    await conn.close();
  }
};

export default httpTrigger;
