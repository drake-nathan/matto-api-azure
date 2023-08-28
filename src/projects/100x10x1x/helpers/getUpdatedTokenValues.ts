import type { Context } from "@azure/functions";
import { getContract } from "viem";

import type { IAttribute } from "../../../db/schemas/schemaTypes";
import { svgToPngAndUpload } from "../../../services/images";
import { getViem } from "../../../web3/providers";
import { Chain, ProjectId, ProjectSlug } from "../..";
import { oneHundredxAbi } from "../abi";
import { parseSvgAttributes } from "./parseSvgAttributes";

interface Params {
  chain: Chain;
  context: Context;
  tokenId: number;
  contractAddress: string;
  projectName: string;
  projectId: ProjectId;
  projectSlug: ProjectSlug;
  existingAttributes?: IAttribute[];
}

interface UpdatedValues {
  svg: string;
  attributes: IAttribute[];
  image: string;
  image_mid: string;
  image_small: string;
  compositeOrder?: string;
}

export const getUpdatedTokenValues = async ({
  context,
  tokenId,
  contractAddress,
  chain,
  projectName,
  projectId,
  projectSlug,
  existingAttributes,
}: Params): Promise<UpdatedValues> => {
  const viemClient = getViem(chain);

  const contract = getContract({
    address: contractAddress as `0x${string}`,
    abi: oneHundredxAbi,
    publicClient: viemClient,
  });

  // function state
  const updatedValues: UpdatedValues = {
    svg: "",
    attributes: [],
    image: "",
    image_mid: "",
    image_small: "",
  };

  // get scriptInputs from blockchain
  try {
    updatedValues.svg = await contract.read.getTokenSVG([BigInt(tokenId)]);

    if (!updatedValues.svg) {
      throw new Error();
    }

    updatedValues.attributes =
      existingAttributes ?? parseSvgAttributes(updatedValues.svg) ?? [];
  } catch (err) {
    context.log.error(
      `Failed to fetch script inputs for ${projectName} ${tokenId} from blockchain`,
      err,
    );
  }

  if (!updatedValues.svg) {
    throw new Error(
      `Failed to fetch svg for ${projectName} ${tokenId} from blockchain`,
    );
  }

  try {
    const pngs = await svgToPngAndUpload(
      updatedValues.svg,
      projectId,
      projectSlug,
      tokenId,
    );

    updatedValues.image = pngs.image;
    updatedValues.image_mid = pngs.image_mid;
    updatedValues.image_small = pngs.image_small;
  } catch (err) {
    context.log.error(
      `Failed to convert svg to png and upload for ${projectName} ${tokenId}`,
      err,
    );
  }

  return updatedValues;
};
