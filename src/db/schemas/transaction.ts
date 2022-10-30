import { Schema } from 'mongoose';
import { ITransaction } from './schemaTypes';

export const transactionSchema = new Schema<ITransaction>({
  project_id: { type: Number, required: true },
  block_number: { type: Number, required: true, index: true },
  transaction_hash: { type: String, required: true, unique: true },
  transaction_date: { type: Date, required: true },
  event_type: { type: String, required: true },
  token_id: { type: Number, required: true },
});

transactionSchema.index({ block_number: 1 }, { unique: true });
