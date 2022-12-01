import * as dotenv from 'dotenv';
import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { Chain, IProject } from '../src/db/schemas/schemaTypes';
import { checkForNewTransactions } from '../src/helpers/transactionHelpers';
import { projects as allProjects } from '../src/projects/projectsInfo';

dotenv.config();

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;
  let projects: IProject[];

  const isDev = process.env.NODE_ENV === 'development';

  // NOTE: This sets only testnet projects in dev, and mainnet projects in prod
  if (isDev) projects = allProjects.filter((p) => p.chain === Chain.goerli);
  else projects = allProjects.filter((p) => p.chain === Chain.mainnet);

  try {
    conn = await connectionFactory(context);

    const arrOfLogValues = await Promise.all(
      projects.map((project) => checkForNewTransactions(project, context, conn)),
    );

    arrOfLogValues.forEach((logValues) => {
      const tokenMsg = logValues.newTokens.length
        ? `New tokens: ${logValues.newTokens.join(', ')}.`
        : 'No new tokens.';

      const logMsg = `${logValues.project_name}: ${logValues.numOfTxsAdded} new transactions. ${tokenMsg} Current supply: ${logValues.currentSupply}`;

      context.log.info(logMsg);
    });
  } catch (error) {
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    await conn.close();
  }
};

export default timerTrigger;
