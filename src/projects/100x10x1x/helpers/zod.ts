import { z } from "zod";

const numericString = z.preprocess(Number, z.number());

export const oneHundredXTokenDataSchema = z.object({
  additional_data: z.string().url().or(z.literal("")),
  animation: z.string().optional(),
  artist: z.string(),
  attributes: z.array(
    z.object({
      trait_type: z.string(),
      value: z.string(),
    }),
  ),
  collection: z.string(),
  description: z.string(),
  external_url: z.string().url(),
  height_ratio: numericString,
  image: z.string(),
  license: z.string(),
  media_type: numericString,
  name: z.string(),
  royalty_address: z.string(),
  royalty_bps: numericString,
  token_entropy: z.string(),
  token_id: numericString,
  website: z.string().url(),
  width_ratio: numericString,
});

export type OneHundredXTokenData = z.infer<typeof oneHundredXTokenDataSchema>;
