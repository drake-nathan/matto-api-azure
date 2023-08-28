import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { getTokenDoc } from "../../../db/queries/tokenQueries";
import { openseaRefresh } from "../../../services/openseaRefresh";
import { Chain, ProjectId, ProjectSlug } from "../..";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";

interface Params {
  chain: Chain;
  conn: Connection;
  context: Context;
  contractAddress: string;
  description?: string;
  projectId: ProjectId;
  projectName: string;
  projectSlug: ProjectSlug;
  tokenId: number;
}

export const updateTokenInDb = async ({
  chain,
  conn,
  context,
  contractAddress,
  description,
  projectId,
  projectName,
  projectSlug,
  tokenId,
}: Params) => {
  const token = await getTokenDoc(projectSlug, tokenId, conn);

  if (!token) {
    throw new Error(`No token found for ${projectName} ${tokenId}`);
  }

  const { svg, image, image_mid, image_small, attributes } =
    await getUpdatedTokenValues({
      context,
      tokenId,
      contractAddress,
      chain,
      projectName,
      projectId,
      projectSlug,
      existingAttributes: token.attributes,
    });

  token.svg = svg;
  token.image = image;
  token.image_mid = image_mid;
  token.image_small = image_small;
  token.attributes = attributes;
  if (description) token.description = description;

  const updatedToken = await token.save();

  if (tokenId === 0) {
    try {
      await openseaRefresh(contractAddress, tokenId);
    } catch (error) {
      context.log.error("Error refreshing opensea.");
    }
  }

  return updatedToken;
};
