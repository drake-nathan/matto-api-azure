import type { Context } from "@azure/functions";

import { getContract, isAddress } from "viem";

import type { Chain, ProjectId, ProjectSlug } from "../..";

import { svgToPngAndUpload } from "../../../services/images";
import { getViem } from "../../../web3/providers";
import { oneHundredxAbi } from "../abi";
import { type OneHundredXTokenData, oneHundredXTokenDataSchema } from "./zod";

interface Params {
  chain: Chain;
  context: Context;
  contractAddress: string;
  projectId: ProjectId;
  projectName: string;
  projectSlug: ProjectSlug;
  tokenId: number;
}

interface UpdatedValues {
  image: string;
  imageMid: string;
  imageSmall: string;
  tokenData: OneHundredXTokenData;
}

export const getUpdatedTokenValues = async ({
  chain,
  context,
  contractAddress,
  projectId,
  projectName,
  projectSlug,
  tokenId,
}: Params): Promise<UpdatedValues> => {
  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const viem = getViem(chain);

  const contract = getContract({
    abi: oneHundredxAbi,
    address: contractAddress,
    client: { public: viem },
  });

  let tokenDataJson: string;
  try {
    tokenDataJson = await contract.read.tokenDataOf([BigInt(tokenId)]);
  } catch (error) {
    throw new Error("Error fetching `tokenDataOf`", { cause: error });
  }

  let tokenData: OneHundredXTokenData;
  try {
    const tokenDataOf = JSON.parse(tokenDataJson);

    tokenData = oneHundredXTokenDataSchema.parse(tokenDataOf);
  } catch (error) {
    throw new Error("Error parsing `tokenDataOf`", { cause: error });
  }

  let image = "";
  let imageMid = "";
  let imageSmall = "";
  // NOTE: temporarily disabling png conversion for token 0
  if (tokenId !== 0) {
    try {
      const pngs = await svgToPngAndUpload(
        tokenData.image,
        projectId,
        projectSlug,
        tokenId,
      );

      image = pngs.image;
      imageMid = pngs.image_mid;
      imageSmall = pngs.image_small;
    } catch (err) {
      context.log.error(
        `Failed to convert svg to png and upload for ${projectName} ${tokenId}`,
        err,
      );
    }
  }

  return {
    image,
    imageMid,
    imageSmall,
    tokenData,
  };
};
