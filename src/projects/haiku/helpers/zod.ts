import { z } from "zod";

const numericString = z.preprocess(Number, z.number());
const BooleanStringSchema = z
  .string()
  .refine((value) => value === "true" || value === "false", {
    message: 'Value should be "true" or "false"',
  });
const BooleanSchema = BooleanStringSchema.transform(
  (value) => value === "true",
);

export const haikuTokenDataSchema = z.object({
  additional_data: z.string().url().or(z.literal("")),
  animation: z.string().optional(),
  artist: z.string(),
  attributes: z.array(
    z.object({
      trait_type: z.string(),
      value: z.string().or(z.number()),
    }),
  ),
  collection: z.string(),
  description: z.string(),
  external_url: z.string().url(),
  height_ratio: numericString,
  image: z.string().url().or(z.literal("")),
  license: z.string(),
  media_type: numericString,
  name: z.string(),
  royalty_address: z.string(),
  royalty_bps: numericString,
  token_data_frozen: BooleanSchema.optional(),
  token_entropy: z.string(),
  website: z.string().url(),
  width_ratio: numericString,
});

export type HaikuTokenData = z.infer<typeof haikuTokenDataSchema>;
