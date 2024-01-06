import { Schema } from "mongoose";

import { IThumbnail } from "./schemaTypes";

export const thumbnailSchema = new Schema<IThumbnail>({
  artblocks_id: { type: String, unique: true },
  image_full: { required: true, type: String },
  image_thumbnail: { required: true, type: String },
  project_id: { required: true, type: Number },
  project_slug: { required: true, type: String },
  token_id: { required: true, type: Number },
});
