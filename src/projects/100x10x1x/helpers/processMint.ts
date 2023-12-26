import { isAddress } from "viem";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import type { IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessMintFunction } from "../../../helpers/tokenHelpers/types";
import { fetchCompositeUpdate } from "../../../services/fetchCompositeUpdate";
import { getTokenZeroAttributes } from "./getTokenZeroAttributes";
import { getTokenZeroDescription } from "./getTokenZeroDescription";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";
import { updateTokenInDb } from "./updateTokenInDb";

export const process100xMint: ProcessMintFunction = async (
  token_id,
  project,
  context,
  conn,
) => {
  const {
    _id: project_id,
    project_name,
    project_slug,
    artist_address,
    collection_description,
    collection_name,
    script_type,
    aspect_ratio,
    website,
    tx_count,
    contract_address: contractAddress,
    chain,
  } = project;

  const isTokenZero = token_id === 0;

  context.log.info("Adding token", token_id, "to", project_name);

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const { tokenData, image, imageMid, imageSmall } =
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
    token_id,
    name: tokenData.name,
    project_id,
    project_name,
    project_slug,
    artist: tokenData.artist,
    artist_address,
    collection_name,
    description,
    script_type,
    svg: tokenData.image,
    image,
    image_mid: imageMid,
    image_small: imageSmall,
    width_ratio: tokenData.width_ratio,
    height_ratio: tokenData.height_ratio,
    aspect_ratio,
    website,
    external_url: tokenData.external_url,
    license: tokenData.license,
    royalty_info: {
      royalty_address: tokenData.royalty_address,
      royalty_bps: tokenData.royalty_bps,
    },
    attributes,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply + 1,
    tx_count + 1,
    conn,
  );

  // lazy update composite image
  fetchCompositeUpdate({ projectSlug: project_slug });

  if (!isTokenZero) {
    await updateTokenInDb({
      chain,
      conn,
      context,
      contractAddress,
      collectionDescription: collection_description,
      project,
      tokenId: 0,
    });
  }

  context.log.info("Processed Mint for token", token_id, "in", project_name);
  return { newTokenId, newSupply };
};
