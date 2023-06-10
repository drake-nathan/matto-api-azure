import { getContract as getContractViem } from 'viem';
import { getViem } from '../../../web3/providers';
import { getTokenDoc } from '../../../db/queries/tokenQueries';
import { oneHundredxAbi } from '../abi';
import type { ProcessEventFunction } from '../../../helpers/tokenHelpers/types';
import type { IScriptInputs } from '../../../db/schemas/schemaTypes';
import { parseSvgAttributes } from './parseScriptInputs';
import { svgToPngAndUpload } from '../../../services/images';

export const process100xEvent: ProcessEventFunction = async (
  token_id,
  project,
  context,
  conn,
) => {
  const {
    _id: project_id,
    project_name,
    project_slug,
    chain,
    contract_address,
  } = project;

  const token = await getTokenDoc(project_slug, token_id, conn);

  if (!token) {
    throw new Error(`No token found for ${project_name} ${token_id}`);
  }

  const viemClient = getViem(chain);

  const contractUsingViem = getContractViem({
    address: contract_address as `0x${string}`,
    abi: oneHundredxAbi,
    publicClient: viemClient,
  });

  try {
    const scriptInputsString = await contractUsingViem.read.scriptInputsOf([
      BigInt(token_id),
    ]);

    const scriptInputs: IScriptInputs = JSON.parse(scriptInputsString);

    if (!scriptInputs.svg_part) {
      throw new Error(
        `Failed to fetch script inputs for ${project_name} ${token_id} from blockchain`,
      );
    }

    const attributes = parseSvgAttributes(scriptInputs.svg_part);

    if (attributes) token.attributes = attributes;
    token.svg = scriptInputs.svg_part;
    token.script_inputs = scriptInputs;
  } catch (err) {
    context.log.error(
      `Failed to fetch script inputs for ${project_name} ${token_id} from blockchain`,
      err,
    );
  }

  if (!token.svg) {
    throw new Error(
      `Failed to fetch svg for ${project_name} ${token_id} from blockchain`,
    );
  }

  try {
    const pngs = await svgToPngAndUpload(token.svg, project_id, project_slug, token_id);

    token.image = pngs.image;
    token.image_mid = pngs.image_mid;
    token.image_small = pngs.image_small;
  } catch (err) {
    context.log.error(
      `Failed to convert svg to png and upload for ${project_name} ${token_id}`,
      err,
    );
  }

  const updatedToken = await token.save();

  return updatedToken;
};
