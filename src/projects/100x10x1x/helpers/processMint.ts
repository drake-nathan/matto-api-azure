import { getContract as getContractViem } from 'viem';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import { addToken } from '../../../db/queries/tokenQueries';
import type { IScriptInputs, IToken } from '../../../db/schemas/schemaTypes';
import { allBLONKStraits } from '../../../helpers/constants';
import type { ProcessMintFunction } from '../../../helpers/tokenHelpers/types';
import { svgToPngAndUpload } from '../../../services/images';
import { getViem } from '../../../web3/providers';
import { oneHundredxAbi } from '../abi';
import { parseSvgAttributes } from './parseScriptInputs';

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
    description,
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

  context.log.info('Adding token', token_id, 'to', project_name);

  const newToken: IToken = {
    token_id,
    name: `${project_name} #${token_id}`,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    collection_name,
    description: description ?? '',
    script_type,
    image: '',
    aspect_ratio,
    website,
    external_url,
    license,
    royalty_info,
    attributes: allBLONKStraits[token_id],
  };

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

    if (attributes) newToken.attributes = attributes;
    newToken.svg = scriptInputs.svg_part;
    newToken.script_inputs = scriptInputs;
  } catch (err) {
    context.log.error(
      `Failed to fetch script inputs for ${project_name} ${token_id} from blockchain`,
      err,
    );
  }

  if (!newToken.svg) {
    throw new Error(
      `Failed to fetch svg for ${project_name} ${token_id} from blockchain`,
    );
  }

  try {
    const pngs = await svgToPngAndUpload(
      newToken.svg,
      project_id,
      project_slug,
      token_id,
    );

    newToken.image = pngs.image;
    newToken.image_mid = pngs.image_mid;
    newToken.image_small = pngs.image_small;
  } catch (err) {
    context.log.error(
      `Failed to convert svg to png and upload for ${project_name} ${token_id}`,
      err,
    );
  }

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply + 1,
    tx_count + 1,
    conn,
  );

  return { newTokenId, newSupply };
};
