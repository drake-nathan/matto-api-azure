import axios from "axios";
import { z } from "zod";

export const fetchDescription = async (url: string): Promise<string> => {
  const { data } = await axios.get<unknown>(url);

  const schema = z.object({
    additional_data: z.string(),
  });

  const { additional_data } = schema.parse(data);

  return additional_data;
};
