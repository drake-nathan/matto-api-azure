import * as dotenv from 'dotenv';
import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { IProject } from '../src/db/schemas/schemaTypes';
import { checkForNewTransactions } from '../src/helpers/transactionHelpers';
import { projects as allProjects } from '../src/projects';

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

    const arrOfLogValues = await Promise.all(
      projects.map((project) => {
        // this coniditional skips projects that don't store transactions
        if (project.events.length) {
          return checkForNewTransactions(project, context, conn);
        }
        return null;
      }),
    );

    arrOfLogValues.forEach((logValues) => {
      if (logValues) {
        const tokenMsg = logValues.newTokens.length
          ? `New tokens: ${logValues.newTokens.join(', ')}.`
          : 'No new tokens.';

        const logMsg = `${logValues.project_name}: ${logValues.numOfTxsAdded} new transactions. ${tokenMsg} Current supply: ${logValues.currentSupply}`;

        context.log.info(logMsg);
      }
    });
  } catch (error) {
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default timerTrigger;
