import { AzureFunction, Context } from '@azure/functions';
import { connect, disconnect } from 'mongoose';
import * as dotenv from 'dotenv';
import { projects } from '../src/projects/projectsInfo';
import { checkForNewProjects, reconcileProject } from '../src/helpers/projectHelpers';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  try {
    await connect(dbConnectionString);

    await checkForNewProjects(projects);

    const reconcileAllProjects = async () => {
      await Promise.all(projects.map((project) => reconcileProject(project)));
    };

    await reconcileAllProjects();
  } catch (error) {
    console.error(error);
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    await disconnect();
  }
};

export default timerTrigger;
