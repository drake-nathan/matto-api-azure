import axios from "axios";
import { z } from "zod";

import type { IAttribute } from "../../../db/schemas/schemaTypes";

export const fetchAttributes = async (url: string): Promise<IAttribute[]> => {
  const { data } = await axios.get<unknown>(url);

  const schema = z.object({
    attributes: z.array(
      z.object({
        trait_type: z.string(),
        value: z.string(),
      }),
    ),
  });

  const { attributes } = schema.parse(data);

  return attributes;
};
