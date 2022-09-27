import { AzureFunction, Context } from '@azure/functions';
import * as dotenv from 'dotenv';
import { connect, disconnect } from 'mongoose';
import { checkIfProjectExists } from '../src/db/queries/projectQueries';
import { getToken } from '../src/db/queries/tokenQueries';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  try {
    await connect(dbConnectionString);
    const { project_slug, token_id } = context.bindingData;

    const doesProjectExist = await checkIfProjectExists(project_slug);

    if (!doesProjectExist) {
      context.res = {
        status: 404,
        body: 'Project not found',
      };
      return;
    }

    const token = await getToken(project_slug, token_id);

    if (!token) {
      context.res = {
        status: 404,
        body: 'Token not found',
      };
      return;
    }

    context.res = {
      status: 200,
      body: token,
    };
  } catch (error) {
    console.error(error);
    context.res = {
      status: 500,
      body: 'Internal Server Error',
    };
  } finally {
    await disconnect();
  }
};

export default httpTrigger;
