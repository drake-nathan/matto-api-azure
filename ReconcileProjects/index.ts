import * as dotenv from 'dotenv';
import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { projects as allProjects } from '../src/projects';
import { checkForNewProjects, reconcileProject } from '../src/helpers/projectHelpers';
import { connectionFactory } from '../src/db/connectionFactory';
import { removeDuplicateTransactions } from '../src/db/queries/transactionQueries';
import { IProject } from '../src/db/schemas/schemaTypes';

dotenv.config();

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection | undefined;
  const projects: IProject[] = [];

  const isDev = process.env.NODE_ENV === 'development';

  allProjects.forEach((project) => {
    if (isDev && project.devParams.useInDev) {
      projects.push(project);
    } else if (!isDev && project.devParams.useInProd) {
      projects.push(project);
    }
  });

  try {
    conn = await connectionFactory(context);

    await checkForNewProjects(context, projects, conn);

    await Promise.all(
      projects.map((project) => reconcileProject(context, project, conn)),
    );

    const numOfDuplicateTransactions = await removeDuplicateTransactions(conn);

    if (numOfDuplicateTransactions) {
      context.log.error('Removed', numOfDuplicateTransactions, 'duplicate transactions.');
    }
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === 'test') console.error(error);
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default timerTrigger;
