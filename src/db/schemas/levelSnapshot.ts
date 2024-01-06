import { Schema } from "mongoose";

import type { ILevelSnapshot } from "./schemaTypes";

export const levelSnapshotSchema = new Schema<ILevelSnapshot>({
  levels: [
    {
      level_shift: { required: true, type: Number },
      token_id: { required: true, type: Number },
      transfer_count: { required: true, type: Number },
    },
  ],
  project_slug: { required: true, type: String },
  snapshot_date: { required: true, type: Date },
});
