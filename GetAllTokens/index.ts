import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { checkIfProjectExists } from '../src/db/queries/projectQueries';
import { getAllTokensForFrontend } from '../src/db/queries/tokenQueries';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { project_slug } = context.bindingData;
  let conn: Connection;

  try {
    conn = await connectionFactory(context);

    const doesProjectExist = await checkIfProjectExists(project_slug, conn);

    if (!doesProjectExist) {
      context.res = {
        status: 404,
        body: 'Project not found',
      };
      return;
    }

    const tokens = await getAllTokensForFrontend(project_slug, conn);

    if (!tokens) {
      context.res = {
        status: 404,
        body: 'Tokens not found',
      };
      return;
    }

    context.res = {
      status: 200,
      body: tokens,
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: 'Internal Server Error',
    };
  } finally {
    await conn.close();
  }
};

export default httpTrigger;
