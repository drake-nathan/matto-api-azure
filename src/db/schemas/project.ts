import { Schema } from 'mongoose';
import { IProject } from './schemaTypes';

export const projectSchema = new Schema<IProject>({
  _id: { type: Number, required: true },
  project_name: { type: String, required: true },
  project_slug: { type: String, required: true, unique: true },
  artist: { type: String, required: true },
  artist_address: { type: String, required: true },
  description: { type: String, required: true },
  maximum_supply: { type: Number },
  current_supply: { type: Number },
  tx_count: { type: Number },
  collection_name: { type: String, required: true },
  collection_image: { type: String, required: true },
  collection_description: { type: String, required: true },
  mintable: { type: Boolean, required: true },
  script_type: { type: String, required: true },
  website: { type: String, required: true },
  external_url: { type: String, required: true },
  license: { type: String, required: true },
  contract_address: { type: String, required: true },
  chain: { type: String, required: true },
  events: [{ type: String }],
  creation_block: { type: Number, required: true },
});
