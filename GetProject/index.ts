import { AzureFunction, Context } from '@azure/functions';
import * as dotenv from 'dotenv';
import { connect, disconnect } from 'mongoose';
import { getProject } from '../src/db/queries/projectQueries';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  try {
    await connect(dbConnectionString);
    const { project_slug } = context.bindingData;

    const project = await getProject(project_slug);

    if (!project) {
      context.res = {
        status: 404,
        body: 'Project not found',
      };
      return;
    }

    context.res = {
      status: 200,
      body: project,
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
