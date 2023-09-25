import { z } from "zod";

import type { IAttribute } from "../../../db/schemas/schemaTypes";
import { fetchAttributes } from "./fetchAttributes";

export const processAttributes = async (
  tokenDataAttributes: IAttribute[],
): Promise<IAttribute[]> => {
  const weGottaFetchEm =
    tokenDataAttributes.length === 1 &&
    tokenDataAttributes[0].trait_type === "JSON";

  if (!weGottaFetchEm) {
    return tokenDataAttributes;
  }

  const url = z.string().url().parse(tokenDataAttributes[0].value);

  const attributes = fetchAttributes(url);

  return attributes;
};
