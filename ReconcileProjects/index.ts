import * as dotenv from 'dotenv';
import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { ProjectId, ProjectSlug, projects as allProjects } from '../src/projects';
import { checkForNewProjects, reconcileProject } from '../src/helpers/projectHelpers';
import { connectionFactory } from '../src/db/connectionFactory';
import { removeDuplicateTransactions } from '../src/db/queries/transactionQueries';
import { IProject, IToken } from '../src/db/schemas/schemaTypes';
import { addToken } from '../src/db/queries/tokenQueries';
import { allBLONKStraits } from '../src/helpers/constants';

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

    // FIXME If a project is already in the db, but one of its hardcoded properties changes, the project in the db is not updated. Use mongoose's save function to do the heavy lifting of seeing whether a project is different and changing only the new properties.
    await checkForNewProjects(context, projects, conn); // checks for new projects in the projects array that it receives and adds it to the database

    for await (const project of projects) {
      await reconcileProject(context, project, conn);
    }

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
