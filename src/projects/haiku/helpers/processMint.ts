import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import { getContract } from "viem";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import type {
  IAttribute,
  IProject,
  IToken,
} from "../../../db/schemas/schemaTypes";
import type { ProcessMintFunction } from "../../../helpers/tokenHelpers/types";
import { fetchResizeUploadImages } from "../../../services/images";
import { getViem } from "../../../web3/providers";
import { haikuAbi } from "../abi";
import { fetchDescription } from "./fetchDescription";
import { processAttributes } from "./processAttributes";
import { type HaikuTokenData, haikuTokenDataSchema } from "./zod";

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

  const viemClient = getViem(chain);

  const contract = getContract({
    address: contractAddress as `0x${string}`,
    abi: haikuAbi,
    publicClient: viemClient,
  });

  let tokenDataJson: string;
  try {
    tokenDataJson = await contract.read.tokenDataOf([BigInt(token_id)]);
  } catch (error) {
    throw new Error("Error fetching `tokenDataOf`", { cause: error });
  }

  let tokenData: HaikuTokenData;
  try {
    const tokenDataOf = JSON.parse(tokenDataJson);

    tokenData = haikuTokenDataSchema.parse(tokenDataOf);
  } catch (error) {
    throw new Error("Error parsing `tokenDataOf`", { cause: error });
  }

  let additionalDescription: string;
  try {
    additionalDescription = await fetchDescription(tokenData.additional_data);
  } catch (error) {
    throw new Error("Error fetching `additional_data`", { cause: error });
  }

  const description = `${tokenData.description}\n\n${additionalDescription}`;

  let attributes: IAttribute[];
  try {
    attributes = await processAttributes(tokenData.attributes);
  } catch (error) {
    throw new Error("Error processing attributes", { cause: error });
  }

  let image_mid: string;
  let image_small: string;
  try {
    [image_mid, image_small] = await fetchResizeUploadImages(
      project_id,
      project_slug,
      token_id,
      tokenData.image,
    );
  } catch (error) {
    throw new Error("Error fetching and uploading images", { cause: error });
  }

  const newToken: IToken = {
    token_id,
    name: tokenData.name,
    project_id,
    project_name,
    project_slug,
    artist: tokenData.artist,
    artist_address,
    description,
    collection_name: tokenData.collection,
    aspect_ratio: tokenData.width_ratio / tokenData.height_ratio,
    image: tokenData.image,
    image_mid,
    image_small,
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
