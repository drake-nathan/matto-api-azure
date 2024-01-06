import { Schema } from "mongoose";

import type { ITransaction } from "./schemaTypes";

export const transactionSchema = new Schema<ITransaction>({
  block_number: { index: true, required: true, type: Number },
  event_type: { required: true, type: String },
  project_id: { required: true, type: Number },
  token_id: { type: Number },
  transaction_date: { required: true, type: Date },
  transaction_hash: { required: true, type: String },
});

transactionSchema.index({ block_number: 1 }, { unique: true });
