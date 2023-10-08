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
  collection: z.string(),
  name: z.string(),
  description: z.string(),
  artist: z.string(),
  image: z.string().url().or(z.literal("")),
  animation: z.string().optional(),
  width_ratio: numericString,
  height_ratio: numericString,
  media_type: numericString,
  license: z.string(),
  token_entropy: z.string(),
  token_data_frozen: BooleanSchema.optional(),
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

export type HaikuTokenData = z.infer<typeof haikuTokenDataSchema>;
