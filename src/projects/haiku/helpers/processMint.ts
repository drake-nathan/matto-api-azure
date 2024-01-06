import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { isAddress } from "viem";

import type { IProject, IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessMintFunction } from "../../../helpers/tokenHelpers/types";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";

export const processHaikuMint: ProcessMintFunction = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
) => {
  const {
    _id: project_id,
    artist_address,
    chain,
    contract_address: contractAddress,
    project_name,
    project_slug,
    tx_count,
  } = project;

  context.log.info("Adding token", token_id, "to", project_name);

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

  const newToken: IToken = {
    additional_info: {
      additional_description: additionalDescription,
      poem,
    },
    artist: tokenData.artist,
    artist_address,
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
    project_id,
    project_name,
    project_slug,
    royalty_info: {
      royalty_address: tokenData.royalty_address,
      royalty_bps: tokenData.royalty_bps,
    },
    token_data_frozen: tokenData.token_data_frozen ?? false,
    token_id,
    website: tokenData.website,
    width_ratio: tokenData.width_ratio,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply ? previousSupply + 1 : 1,
    tx_count ? tx_count + 1 : 1,
    conn,
  );

  return { newSupply, newTokenId };
};
