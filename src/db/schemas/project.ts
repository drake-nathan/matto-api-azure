import { Schema } from 'mongoose';
import { IProject } from './schemaTypes';

export const projectSchema = new Schema<IProject>({
  _id: { type: Number, required: true },
  project_name: { type: String, required: true, maxLength: 100 },
  project_slug: { type: String, required: true, maxLength: 100, unique: true },
  artist: { type: String, required: true, maxlength: 100 },
  artist_address: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  maximum_supply: { type: Number },
  current_supply: { type: Number },
  collection_name: { type: String, required: true, maxlength: 100 },
  collection_image: { type: String, required: true },
  collection_description: { type: String, required: true, maxlength: 500 },
  mintable: { type: Boolean, required: true },
  script_type: { type: String, required: true },
  website: { type: String, required: true },
  external_url: { type: String, required: true },
  license: { type: String, required: true },
  contract_address: { type: String, required: true },
  events: [{ type: String, maxlength: 100 }],
  creation_block: { type: Number, required: true },
});
