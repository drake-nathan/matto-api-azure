import { getContract } from 'viem';
import type { Context } from '@azure/functions';
import { getViem } from '../../../web3/providers';
import { oneHundredxAbi } from '../abi';
import type { IAttribute, IScriptInputs } from '../../../db/schemas/schemaTypes';
import { parseSvgAttributes } from './parseScriptInputs';
import { svgToPngAndUpload } from '../../../services/images';
import { Chain, ProjectId, ProjectSlug } from '../..';
import { svgStart } from './svgStart';

interface Params {
  chain: Chain;
  context: Context;
  tokenId: number;
  contractAddress: string;
  projectName: string;
  projectId: ProjectId;
  projectSlug: ProjectSlug;
  existingAttributes?: IAttribute[];
  existingSvg?: string;
}

interface UpdatedValues {
  svg: string;
  attributes: IAttribute[];
  scriptInputs: IScriptInputs;
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
  existingSvg,
}: Params): Promise<UpdatedValues> => {
  const viemClient = getViem(chain);

  const contract = getContract({
    address: contractAddress as `0x${string}`,
    abi: oneHundredxAbi,
    publicClient: viemClient,
  });

  // function state
  const updatedValues: UpdatedValues = {
    svg: '',
    attributes: [],
    scriptInputs: {},
    image: '',
    image_mid: '',
    image_small: '',
  };

  // get scriptInputs from blockchain
  try {
    const scriptInputsString = await contract.read.scriptInputsOf([BigInt(tokenId)]);
    const currentOwner = await contract.read.ownerOf([BigInt(tokenId)]);

    const scriptInputs: IScriptInputs = JSON.parse(scriptInputsString);

    if (!scriptInputs.svg_part) {
      throw new Error(
        `Failed to fetch script inputs for ${projectName} ${tokenId} from blockchain`,
      );
    }

    const attributes =
      existingAttributes ?? parseSvgAttributes(scriptInputs.svg_part) ?? [];

    updatedValues.attributes = attributes;
    if (!existingSvg) updatedValues.svg = svgStart + scriptInputs.svg_part;
    updatedValues.scriptInputs = scriptInputs;
    updatedValues.scriptInputs.current_owner = currentOwner;
  } catch (err) {
    context.log.error(
      `Failed to fetch script inputs for ${projectName} ${tokenId} from blockchain`,
      err,
    );
  }

  if (tokenId === 0) {
    updatedValues.svg = await contract.read.getCompositeSVG();
  }

  if (!updatedValues.svg) {
    throw new Error(`Failed to fetch svg for ${projectName} ${tokenId} from blockchain`);
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
