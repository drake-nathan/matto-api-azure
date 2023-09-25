import { z } from "zod";

const numericString = z.preprocess(Number, z.number());

export const haikuTokenDataSchema = z.object({
  collection: z.string(),
  name: z.string(),
  description: z.string(),
  artist: z.string(),
  image: z.string().url(),
  animation: z.string().optional(),
  width_ratio: numericString,
  height_ratio: numericString,
  media_type: numericString,
  license: z.string(),
  token_entropy: z.string(),
  token_data_frozen: z.boolean().optional(),
  additional_data: z.string().url(),
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

// const numericStringNullable = z.preprocess((val) => {
//   if (val === "") {
//     return null;
//   }
//   if (typeof val === "string") {
//     return Number(val);
//   }
//   if (typeof val === "number") {
//     return val;
//   }
//   return null;
// }, z.number().nullable());
