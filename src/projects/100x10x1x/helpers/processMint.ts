import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import type { IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessMintFunction } from "../../../helpers/tokenHelpers/types";
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
    artist,
    artist_address,
    collection_description,
    collection_name,
    script_type,
    aspect_ratio,
    website,
    external_url,
    license,
    royalty_info,
    tx_count,
    contract_address,
    chain,
  } = project;

  const isTokenZero = token_id === 0;

  context.log.info("Adding token", token_id, "to", project_name);

  const { svg, image, image_mid, image_small, attributes } =
    await getUpdatedTokenValues({
      context,
      tokenId: token_id,
      contractAddress: contract_address,
      chain,
      projectName: project_name,
      projectId: project_id,
      projectSlug: project_slug,
    });

  const tokenZeroDescription = await getTokenZeroDescription(
    chain,
    contract_address,
    collection_description,
  );

  const newToken: IToken = {
    token_id,
    name: isTokenZero ? `${collection_name}` : `#${token_id}`,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    collection_name,
    description: isTokenZero ? tokenZeroDescription : collection_description,
    script_type,
    svg,
    image,
    image_mid,
    image_small,
    aspect_ratio,
    website,
    external_url,
    license,
    royalty_info,
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

  if (!isTokenZero) {
    await updateTokenInDb({
      chain,
      context,
      conn,
      tokenId: 0,
      projectId: project_id,
      projectName: project_name,
      projectSlug: project_slug,
      contractAddress: contract_address,
      description: tokenZeroDescription,
    });
  }
  context.log.info("Processed Mint for token", token_id, "in", project_name);
  return { newTokenId, newSupply };
};
