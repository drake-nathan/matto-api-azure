import * as dotenv from 'dotenv';
import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { projects as allProjects } from '../src/projects/projectsInfo';
import { checkForNewProjects, reconcileProject } from '../src/helpers/projectHelpers';
import { connectionFactory } from '../src/db/connectionFactory';
import { removeDuplicateTransactions } from '../src/db/queries/transactionQueries';
import { Chain, IProject } from '../src/db/schemas/schemaTypes';

dotenv.config();

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;
  let projects: IProject[];

  const isDev = process.env.NODE_ENV !== 'production';

  // NOTE: This sets only testnet projects in dev, and mainnet projects in prod
  if (isDev) projects = allProjects.filter((p) => p.chain === Chain.goerli);
  else projects = allProjects.filter((p) => p.chain === Chain.mainnet);

  try {
    conn = await connectionFactory(context);

    await checkForNewProjects(context, projects, conn);

    const reconcileAllProjects = async () => {
      await Promise.all(
        projects.map((project) => reconcileProject(context, project, conn)),
      );
    };

    await reconcileAllProjects();

    const numOfDuplicateTransactions = await removeDuplicateTransactions(conn);

    if (numOfDuplicateTransactions) {
      context.log.error('Removed', numOfDuplicateTransactions, 'duplicate transactions.');
    }
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    await conn.close();
  }
};

export default timerTrigger;
