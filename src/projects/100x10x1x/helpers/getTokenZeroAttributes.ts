import type { Connection } from "mongoose";

import { getAllTokensFromProject } from "../../../db/queries/tokenQueries";
import { getTransactionCountByEvent } from "../../../db/queries/transactionQueries";
import type { IAttribute } from "../../../db/schemas/schemaTypes";
import { ProjectId, ProjectSlug } from "../..";

export const getTokenZeroAttributes = async (
  conn: Connection,
): Promise<IAttribute[]> => {
  const tokens = await getAllTokensFromProject(
    ProjectSlug["100x10x1-a-goerli"],
    conn,
  );

  const orderChangedCount = await getTransactionCountByEvent(
    conn,
    ProjectId["100x10x1-a-goerli"],
    "OrderChanged",
  );
  const tokenCount = tokens.length;
  const shuffles = orderChangedCount - tokenCount;

  const cummulativeValues: Record<string, number> = {
    Curves: 0,
    Lines: 0,
    "Simple Curves": 0,
    "Complex Curves": 0,
    "Simple Lines": 0,
    "Complex Lines": 0,
    Ellipses: 0,
  };

  tokens.forEach(({ attributes }) => {
    Object.keys(cummulativeValues).forEach((trait_type) => {
      const value = attributes.find(({ trait_type: tt }) => tt === trait_type)
        ?.value;

      if (value) {
        cummulativeValues[trait_type] += Number(value);
      }
    });
  });

  const attributes: IAttribute[] = Object.entries<number | string>(
    cummulativeValues,
  )
    .map(([trait_type, value]) => ({
      trait_type,
      value,
    }))
    .concat([
      { trait_type: "Shuffles", value: shuffles },
      { trait_type: "Palette", value: "Durham Sunset" },
      { trait_type: "Composite Image License", value: "CC BY-NC 4.0" },
    ]);

  return attributes;
};
