import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Address } from "viem";

import type { Chain } from "../..";
import type { IProject, IToken } from "../../../db/schemas/schemaTypes";

import { getTokenZeroAttributes } from "./getTokenZeroAttributes";
import { getTokenZeroDescription } from "./getTokenZeroDescription";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";

interface Params {
  chain: Chain;
  collectionDescription: string;
  conn: Connection;
  context: Context;
  contractAddress: Address;
  project: IProject;
  tokenId: number;
}

export const updateTokenInDb = async ({
  chain,
  collectionDescription,
  conn,
  context,
  contractAddress,
  project,
  tokenId,
}: Params) => {
  if (tokenId === 0) context.log.info("Updating token zero");

  const { image, imageMid, imageSmall, tokenData } =
    await getUpdatedTokenValues({
      chain,
      context,
      contractAddress,
      projectId: project.project_id,
      projectName: project.project_name,
      projectSlug: project.project_slug,
      tokenId,
    });

  const attributes =
    tokenId === 0 ? await getTokenZeroAttributes(conn) : tokenData.attributes;

  const description =
    tokenId === 0 ?
      await getTokenZeroDescription(
        chain,
        contractAddress,
        collectionDescription,
      )
    : tokenData.description;

  const Token = conn.model<IToken>("Token");

  const query = Token.findOneAndUpdate(
    { project_slug: project.project_slug, token_id: tokenId },
    {
      additional_data: tokenData.additional_data,
      artist: tokenData.artist,
      attributes,
      collection_name: tokenData.collection,
      description,
      external_url: tokenData.external_url,
      height_ratio: tokenData.height_ratio,
      license: tokenData.license,
      name: tokenData.name,
      royalty_info: {
        royalty_address: tokenData.royalty_address,
        royalty_bps: tokenData.royalty_bps,
      },
      svg: tokenData.image,
      website: tokenData.website,
      width_ratio: tokenData.width_ratio,
      // don't overwrite image if it's already there
      ...(image ? { image, image_mid: imageMid, image_small: imageSmall } : {}),
    },
    { new: true },
  );

  const result = await query.lean().exec();

  return result;
};
