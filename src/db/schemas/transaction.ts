import { Schema } from 'mongoose';
import { ITransaction } from './schemaTypes';

export const transactionSchema = new Schema<ITransaction>({
  project_id: { type: Number, required: true },
  block_number: { type: Number, required: true },
  transaction_hash: { type: String, required: true },
  event_type: { type: String, required: true },
  token_id: { type: Number, required: true },
});
