import { Schema } from 'mongoose';
import { ILevelSnapshot } from './schemaTypes';

export const levelSnapshotSchema = new Schema<ILevelSnapshot>({
  snapshot_date: { type: Date, required: true },
  project_slug: { type: String, required: true },
  levels: [
    {
      token_id: { type: Number, required: true },
      transfer_count: { type: Number, required: true },
      level_shift: { type: Number, required: true },
    },
  ],
});
