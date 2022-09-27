import { AzureFunction, Context } from '@azure/functions';
import { connect, connection, disconnect } from 'mongoose';
import * as dotenv from 'dotenv';
import { checkForNewTransactions } from '../src/helpers/transactionHelpers';
import { projects } from '../src/projects/projectsInfo';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  const wasDbAlreadyConnected = connection.readyState === 1;

  try {
    if (!wasDbAlreadyConnected) await connect(dbConnectionString);
    const arrOfLogValues = await Promise.all(
      projects.map((project) => checkForNewTransactions(project)),
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
    if (!wasDbAlreadyConnected) await disconnect();
  }
};

export default timerTrigger;
