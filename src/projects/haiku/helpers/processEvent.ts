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
    chain,
    contract_address: contractAddress,
    project_name,
    project_slug,
  } = project;

  context.log.info(
    `ProcessEvent: Processing ${event_type} for ${project_name}.`,
  );

  // NOTE: Haiku doesn't update on transfers
  if (event_type === "Transfer" || !token_id) return null;

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const {
    additionalDescription,
    aspectRatio,
    attributes,
    description,
    imageMid,
    imageSmall,
    poem,
    tokenData,
  } = await getUpdatedTokenValues({
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
      additional_info: {
        additional_description: additionalDescription,
        poem,
      },
      artist: tokenData.artist,
      aspect_ratio: aspectRatio,
      attributes,
      collection_name: tokenData.collection,
      description,
      external_url: tokenData.external_url,
      height_ratio: tokenData.height_ratio,
      image: tokenData.image,
      image_mid: imageMid,
      image_small: imageSmall,
      license: tokenData.license,
      name: tokenData.name,
      royalty_info: {
        royalty_address: tokenData.royalty_address,
        royalty_bps: tokenData.royalty_bps,
      },
      token_data_frozen: tokenData.token_data_frozen ?? false,
      website: tokenData.website,
      width_ratio: tokenData.width_ratio,
    },
    { new: true },
  );

  const result = await query.lean().exec();

  return result;
};
