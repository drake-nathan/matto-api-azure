import { Schema, model } from 'mongoose';
import { ITransaction } from './modelTypes';

const transactionSchema = new Schema<ITransaction>({
  project_id: { type: Number, required: true },
  block_number: { type: Number, required: true },
  transaction_hash: { type: String, required: true },
  event_type: { type: String, required: true },
  token_id: { type: Number, required: true },
});

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
