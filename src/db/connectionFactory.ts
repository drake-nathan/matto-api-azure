import { createConnection, Schema } from 'mongoose';
import * as dotenv from 'dotenv';
import { Context } from '@azure/functions';
import { projectSchema } from './schemas/project';
import { tokenSchema } from './schemas/token';
import { transactionSchema } from './schemas/transaction';
import { thumbnailSchema } from './schemas/thumbnail';
import { levelSnapshotSchema } from './schemas/levelSnapshot';

export const connectionFactory = async (context?: Context) => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  // mongoose config: set a validator function that allows empty strings
  Schema.Types.String.checkRequired((v) => typeof v === 'string');

  const conn = await createConnection(dbConnectionString).asPromise();

  if (context) {
    conn.addListener('error', (err) => {
      context.log.error('Error connecting to database', err);
    });
  }

  conn.model('Project', projectSchema);
  conn.model('Token', tokenSchema);
  conn.model('Transaction', transactionSchema);
  conn.model('Thumbnail', thumbnailSchema);
  conn.model('LevelSnapshot', levelSnapshotSchema);

  return conn;
};
