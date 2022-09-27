import { createConnection } from 'mongoose';
import * as dotenv from 'dotenv';
import { Context } from '@azure/functions';
import { projectSchema } from './schemas/project';
import { tokenSchema } from './schemas/token';
import { transactionSchema } from './schemas/transaction';

export const connectionFactory = async (context: Context) => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  const conn = await createConnection(dbConnectionString).asPromise();

  conn.addListener('error', (err) => {
    context.log.error('Error connecting to database', err);
  });

  conn.model('Project', projectSchema);
  conn.model('Token', tokenSchema);
  conn.model('Transaction', transactionSchema);

  return conn;
};
