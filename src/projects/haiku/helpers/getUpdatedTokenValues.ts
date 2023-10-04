import { type Address, getContract } from "viem";

import type { IAttribute } from "../../../db/schemas/schemaTypes";
import { fetchResizeUploadImages } from "../../../services/images";
import { getViem } from "../../../web3/providers";
import { Chain, ProjectId, ProjectSlug } from "../..";
import { haikuAbi } from "../abi";
import { fetchDescription } from "./fetchDescription";
import { processAttributes } from "./processAttributes";
import { type HaikuTokenData, haikuTokenDataSchema } from "./zod";

interface Params {
  chain: Chain;
  contractAddress: Address;
  projectId: ProjectId;
  projectSlug: ProjectSlug;
  tokenId: number;
}

interface UpdatedValues {
  attributes: IAttribute[];
  description: string;
  imageMid: string;
  imageSmall: string;
  tokenData: HaikuTokenData;
  aspectRatio: number;
}

export const getUpdatedTokenValues = async ({
  chain,
  contractAddress,
  projectId,
  projectSlug,
  tokenId,
}: Params): Promise<UpdatedValues> => {
  const viemClient = getViem(chain);

  const contract = getContract({
    address: contractAddress,
    abi: haikuAbi,
    publicClient: viemClient,
  });

  let tokenDataJson: string;
  try {
    tokenDataJson = await contract.read.tokenDataOf([BigInt(tokenId)]);
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
    if (tokenData.additional_data) {
      additionalDescription = await fetchDescription(tokenData.additional_data);
    } else {
      additionalDescription = "";
    }
  } catch (error) {
    throw new Error("Error fetching `additional_data`", { cause: error });
  }

  const description =
    tokenData.description && additionalDescription
      ? `${tokenData.description}\n\nAI Interpretation:\n${additionalDescription}`
      : "";

  let attributes: IAttribute[];
  try {
    attributes = await processAttributes(tokenData.attributes);
  } catch (error) {
    throw new Error("Error processing attributes", { cause: error });
  }

  let imageMid: string;
  let imageSmall: string;
  try {
    if (tokenData.image) {
      [imageMid, imageSmall] = await fetchResizeUploadImages(
        projectId,
        projectSlug,
        tokenId,
        tokenData.image,
      );
    } else {
      imageMid = "";
      imageSmall = "";
    }
  } catch (error) {
    throw new Error("Error fetching and uploading images", { cause: error });
  }

  const aspectRatio =
    tokenData.width_ratio && tokenData.height_ratio
      ? tokenData.width_ratio / tokenData.height_ratio
      : 1;

  return {
    attributes,
    description,
    imageMid,
    imageSmall,
    tokenData,
    aspectRatio,
  };
};
