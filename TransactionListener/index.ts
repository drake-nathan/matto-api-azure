import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { checkForNewTransactions } from '../src/helpers/transactionHelpers';
import { projects } from '../src/projects/projectsInfo';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;

  try {
    conn = await connectionFactory();

    const arrOfLogValues = await Promise.all(
      projects.map((project) => checkForNewTransactions(project, context, conn)),
    );

    arrOfLogValues.forEach((logValues) => {
      const tokenMsg = logValues.newTokens.length
        ? `New tokens: ${logValues.newTokens.join(', ')}.`
        : 'No new tokens.';

      const logMsg = `${logValues.project_name}: ${logValues.numOfTxsAdded} new transactions. ${tokenMsg} Current supply: ${logValues.currentSupply}`;

      context.log(logMsg);
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
