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
      transfer_count: { type: Number },
      token_entropy: { type: String },
      current_owner: { type: String },
      previous_owner: { type: String },
      custom_rule: { type: String },
      custom_data: { type: String },
      level_shift: { type: Number },
      imageURI_base: { type: String },
      audioURI_base: { type: String },
      media_URI: { type: String },
    },
    required: true,
  },
  image: { type: String },
  image_mid: { type: String },
  thumbnail_url: { type: String },
  image_data: { type: String },
  animation_url: { type: String },
  generator_url: { type: String },
  generator_mobile: { type: String },
  generator_alt: { type: String },
  website: { type: String, required: true },
  external_url: { type: String, required: true },
  license: { type: String, required: true },
  royalty_info: {
    royalty_fee_by_id: { type: Number, required: true },
    artist_address: { type: String },
    charity_address: { type: String },
    additional_payee: { type: String },
    additional_payee_bps: { type: Number },
  },
  attributes: [
    {
      trait_type: { type: String },
      value: { type: Schema.Types.Mixed },
    },
  ],
});

tokenSchema.index({ token_id: 1 });
