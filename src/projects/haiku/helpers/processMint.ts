import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import { isAddress } from "viem";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import type { IProject, IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessMintFunction } from "../../../helpers/tokenHelpers/types";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";

export const processHaikuMint: ProcessMintFunction = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
) => {
  const {
    _id: project_id,
    project_name,
    project_slug,
    artist_address,
    chain,
    contract_address: contractAddress,
    tx_count,
  } = project;

  context.log.info("Adding token", token_id, "to", project_name);

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const {
    attributes,
    description,
    imageMid,
    imageSmall,
    tokenData,
    aspectRatio,
    poem,
    additionalDescription,
  } = await getUpdatedTokenValues({
    chain,
    contractAddress,
    projectId: project_id,
    projectSlug: project_slug,
    tokenId: token_id,
  });

  const newToken: IToken = {
    token_id,
    name: tokenData.name,
    project_id,
    project_name,
    project_slug,
    artist: tokenData.artist,
    artist_address,
    description,
    additional_info: {
      poem,
      additional_description: additionalDescription,
    },
    collection_name: tokenData.collection,
    width_ratio: tokenData.width_ratio,
    height_ratio: tokenData.height_ratio,
    aspect_ratio: aspectRatio,
    image: tokenData.image,
    image_mid: imageMid,
    image_small: imageSmall,
    external_url: tokenData.external_url,
    website: tokenData.website,
    license: tokenData.license,
    royalty_info: {
      royalty_address: tokenData.royalty_address,
      royalty_bps: tokenData.royalty_bps,
    },
    attributes,
    token_data_frozen: tokenData.token_data_frozen ?? false,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply ? previousSupply + 1 : 1,
    tx_count ? tx_count + 1 : 1,
    conn,
  );

  return { newTokenId, newSupply };
};
