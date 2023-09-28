import { isAddress } from "viem";

import type { IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessEventFunction } from "../../../helpers/tokenHelpers/types";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";

export const processHaikuEvent: ProcessEventFunction = async (
  token_id,
  project,
  context,
  conn,
  script_inputs,
  event_type,
) => {
  const {
    _id: project_id,
    project_slug,
    project_name,
    chain,
    contract_address: contractAddress,
  } = project;

  context.log.info(
    `ProcessEvent: Processing ${event_type} for ${project_name}.`,
  );

  // NOTE: Haiku doesn't update on transfers
  if (event_type === "Transfer" || !token_id) return null;

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const { attributes, description, imageMid, imageSmall, tokenData } =
    await getUpdatedTokenValues({
      chain,
      contractAddress,
      projectId: project_id,
      projectSlug: project_slug,
      tokenId: token_id,
    });

  const Token = conn.model<IToken>("Token");

  const query = Token.findOneAndUpdate(
    { project_id, token_id },
    {
      description,
      image: tokenData.image,
      image_mid: imageMid,
      image_small: imageSmall,
      attributes,
    },
    { new: true },
  );

  const result = await query.lean().exec();

  return result;
};
