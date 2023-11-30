import { z } from "zod";

const numericString = z.preprocess(Number, z.number());

export const oneHundredXTokenDataSchema = z.object({
  token_id: numericString,
  name: z.string(),
  collection: z.string(),
  description: z.string(),
  artist: z.string(),
  image: z.string(),
  animation: z.string().optional(),
  width_ratio: numericString,
  height_ratio: numericString,
  media_type: numericString,
  license: z.string(),
  token_entropy: z.string(),
  additional_data: z.string().url().or(z.literal("")),
  website: z.string().url(),
  external_url: z.string().url(),
  royalty_address: z.string(),
  royalty_bps: numericString,
  attributes: z.array(
    z.object({
      trait_type: z.string(),
      value: z.string(),
    }),
  ),
});

export type OneHundredXTokenData = z.infer<typeof oneHundredXTokenDataSchema>;
