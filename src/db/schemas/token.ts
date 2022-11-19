import { Schema } from 'mongoose';
import { IToken } from './schemaTypes';

export const tokenSchema = new Schema<IToken>({
  token_id: { type: Number, required: true },
  name: { type: String, required: true },
  project_id: { type: Number, required: true },
  project_name: { type: String, required: true },
  project_slug: { type: String, required: true },
  artist: { type: String, required: true },
  artist_address: { type: String, required: true },
  description: { type: String, required: true },
  collection_name: { type: String, required: true },
  aspect_ratio: { type: Number, required: true },
  script_type: { type: String, required: true },
  script_inputs: {
    type: {
      token_id: { type: Number, required: true },
      token_entropy: { type: String, required: true },
      transfer_count: { type: Number, required: true },
      current_owner: { type: String, required: true },
      previous_owner: { type: String, required: true },
      custom_rule: { type: String },
      level_shift: { type: Number },
    },
    required: true,
  },
  image: { type: String },
  thumbnail_url: { type: String },
  image_data: { type: String },
  animation_url: { type: String },
  generator_url: { type: String },
  website: { type: String, required: true },
  external_url: { type: String, required: true },
  license: { type: String, required: true },
  royalty_info: {
    artist_address: { type: String, required: true },
    additional_payee: { type: String },
    additional_payee_bps: { type: Number },
    royalty_fee_by_id: { type: Number, required: true },
  },
  attributes: [
    {
      trait_type: { type: String },
      value: { type: Schema.Types.Mixed },
    },
  ],
});

tokenSchema.index({ token_id: 1 }, { unique: true });
