import { Schema } from 'mongoose';
import { IThumbnail } from './schemaTypes';

export const thumbnailSchema = new Schema<IThumbnail>({
  project_slug: { type: String, required: true },
  project_id: { type: Number, required: true },
  token_id: { type: Number, required: true },
  artblocks_id: { type: String, unique: true },
  image_full: { type: String, required: true },
  image_thumbnail: { type: String, required: true },
});
