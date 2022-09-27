import { Schema, model } from 'mongoose';
import { IToken } from './modelTypes';

const tokenSchema = new Schema<IToken>({
  token_id: { type: Number, required: true },
  name: { type: String, required: true, maxLength: 100 },
  project_id: { type: Number, required: true },
  project_name: { type: String, required: true, maxLength: 100 },
  project_slug: { type: String, required: true, maxLength: 100 },
  artist: { type: String, required: true, maxLength: 100 },
  artist_address: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 500 },
  collection_name: { type: String, required: true, maxLength: 100 },
  aspect_ratio: { type: Number, required: true },
  script_type: { type: String, required: true },
  script_inputs: {
    type: {
      token_id: { type: Number, required: true },
      token_entropy: { type: String, required: true, maxLength: 100 },
      transfer_count: { type: Number, required: true },
      current_owner: { type: String, required: true, maxLength: 100 },
      previous_owner: { type: String, required: true, maxLength: 100 },
      custom_rule: { type: String },
    },
    required: true,
  },
  image: { type: String },
  image_data: { type: String },
  animation_url: { type: String },
  generator_url: { type: String },
  website: { type: String, required: true },
  external_url: { type: String, required: true },
  license: { type: String, required: true, maxLength: 100 },
  royalty_info: {
    artist_address: { type: String, required: true, maxLength: 100 },
    additional_payee: { type: String, maxLength: 100 },
    additional_payee_bps: { type: Number },
    royalty_fee_by_id: { type: Number, required: true },
  },
  attributes: [
    {
      trait_type: { type: String, maxLength: 100 },
      value: { type: Schema.Types.Mixed, maxLength: 100 },
    },
  ],
});

export const Token = model<IToken>('Token', tokenSchema);
