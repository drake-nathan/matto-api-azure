import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Address } from "viem";

import type { IProject, IToken } from "../../../db/schemas/schemaTypes";
import type { Chain } from "../..";
import { getTokenZeroAttributes } from "./getTokenZeroAttributes";
import { getTokenZeroDescription } from "./getTokenZeroDescription";
import { getUpdatedTokenValues } from "./getUpdatedTokenValues";

interface Params {
  chain: Chain;
  conn: Connection;
  context: Context;
  contractAddress: Address;
  collectionDescription: string;
  project: IProject;
  tokenId: number;
}

export const updateTokenInDb = async ({
  chain,
  conn,
  context,
  contractAddress,
  collectionDescription,
  project,
  tokenId,
}: Params) => {
  const { tokenData, image, imageMid, imageSmall } =
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
    tokenId === 0
      ? await getTokenZeroDescription(
          chain,
          contractAddress,
          collectionDescription,
        )
      : tokenData.description;

  const Token = conn.model<IToken>("Token");

  const query = Token.findOneAndUpdate(
    { project_id: project.projectId, token_id: tokenId },
    {
      name: tokenData.name,
      collection_name: tokenData.collection,
      artist: tokenData.artist,
      description,
      width_ratio: tokenData.width_ratio,
      height_ratio: tokenData.height_ratio,
      license: tokenData.license,
      additional_data: tokenData.additional_data,
      svg: tokenData.image,
      image,
      image_mid: imageMid,
      image_small: imageSmall,
      external_url: tokenData.external_url,
      website: tokenData.website,
      royalty_info: {
        royalty_address: tokenData.royalty_address,
        royalty_bps: tokenData.royalty_bps,
      },
      attributes,
    },
    { new: true },
  );

  const result = await query.lean().exec();

  // if (tokenId === 0) {
  //   try {
  //     await openseaRefresh(contractAddress, tokenId);
  //   } catch (error) {
  //     context.log.error("Error refreshing opensea.");
  //   }
  // }

  return result;
};
