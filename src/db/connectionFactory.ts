import { createConnection } from 'mongoose';
import * as dotenv from 'dotenv';
import { projectSchema } from './schemas/project';
import { tokenSchema } from './schemas/token';
import { transactionSchema } from './schemas/transaction';

export const connectionFactory = async () => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  const conn = await createConnection(dbConnectionString).asPromise();

  conn.model('Project', projectSchema);
  conn.model('Token', tokenSchema);
  conn.model('Transaction', transactionSchema);

  return conn;
};
