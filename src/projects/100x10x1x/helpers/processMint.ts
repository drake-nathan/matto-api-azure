import { configDotenv } from "dotenv";
import { isAddress } from "viem";

import type { IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessMintFunction } from "../../../helpers/tokenHelpers/types";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import { fetchCompositeUpdate } from "../../../services/fetchCompositeUpdate";
import { getTokenZeroAttributes } from "./getTokenZeroAttributes";
import { getTokenZeroDescription } from "./getTokenZeroDescription";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";
import { updateTokenInDb } from "./updateTokenInDb";

configDotenv();
const rootServerUrl = process.env.ROOT_URL;

export const process100xMint: ProcessMintFunction = async (
  token_id,
  project,
  context,
  conn,
) => {
  const {
    _id: project_id,
    artist_address,
    aspect_ratio,
    chain,
    collection_description,
    collection_name,
    contract_address: contractAddress,
    project_name,
    project_slug,
    script_type,
    tx_count,
    website,
  } = project;

  const isTokenZero = token_id === 0;

  context.log.info("Adding token", token_id, "to", project_name);

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const { image, imageMid, imageSmall, tokenData } =
    await getUpdatedTokenValues({
      chain,
      context,
      contractAddress,
      projectId: project_id,
      projectName: project_name,
      projectSlug: project_slug,
      tokenId: token_id,
    });

  const description = isTokenZero
    ? await getTokenZeroDescription(
        chain,
        contractAddress,
        collection_description,
      )
    : tokenData.description;

  const attributes = isTokenZero
    ? await getTokenZeroAttributes(conn)
    : tokenData.attributes;

  const newToken: IToken = {
    artist: tokenData.artist,
    artist_address,
    aspect_ratio,
    attributes,
    collection_name,
    description,
    external_url: tokenData.external_url,
    height_ratio: tokenData.height_ratio,
    image,
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
    script_type,
    svg: tokenData.image,
    ...(isTokenZero
      ? { svgGen: `${rootServerUrl}/project/${project_slug}/svg/${token_id}` }
      : {}),
    token_id,
    website,
    width_ratio: tokenData.width_ratio,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply + 1,
    tx_count + 1,
    conn,
  );

  if (!isTokenZero) {
    await updateTokenInDb({
      chain,
      collectionDescription: collection_description,
      conn,
      context,
      contractAddress,
      project,
      tokenId: 0,
    });
  }

  // lazy update composite image
  void fetchCompositeUpdate({ projectSlug: project_slug });

  context.log.info("Processed Mint for token", token_id, "in", project_name);
  return { newSupply, newTokenId };
};
