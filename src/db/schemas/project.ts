import { Schema } from 'mongoose';
import { IProject } from './schemaTypes';

export const projectSchema = new Schema<IProject>({
  _id: { type: Number, required: true },
  project_name: { type: String, required: true },
  project_slug: { type: String, required: true, unique: true },
  artist: { type: String, required: true },
  artist_address: { type: String, required: true },
  description: { type: String },
  appended_description: { type: String },
  maximum_supply: { type: Number, required: true },
  starting_index: { type: Number, required: true },
  current_supply: { type: Number },
  tx_count: { type: Number, required: true },
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
  royalty_info: {
    royalty_fee_by_id: { type: Number, required: true },
    artist_address: { type: String },
    charity_address: { type: String },
    additional_payee: { type: String },
    additional_payee_bps: { type: Number },
  },
  gen_script: { type: String },
  devParams: {
    useInDev: { type: Boolean, required: true },
    useInProd: { type: Boolean, required: true },
    isBulkMint: { type: Boolean },
    usesPuppeteer: { type: Boolean },
  },
});
