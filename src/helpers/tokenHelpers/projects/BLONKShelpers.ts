import { getContract as getContractViem } from 'viem';
import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { IProject, IToken } from '../../../db/schemas/schemaTypes';
import type { ProcessEventReturn, ProcessMintFunction } from '../types';
import { allBLONKStraits } from '../../constants';
import { addToken, getTokenDoc } from '../../../db/queries/tokenQueries';
import {
  updateProjectSupplyAndCount,
  getProjectCurrentSupply,
} from '../../../db/queries/projectQueries';
import { getViem } from '../../../web3/providers';
import { blonksAbi } from '../../../projects/abis/blonksAbi';
import { svgToPngAndUpload } from '../../../services/images';

export const processBlonksMint: ProcessMintFunction = async (
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
    name: `BLONK #${token_id}`,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    collection_name,
    description: description || '',
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
    abi: blonksAbi,
    publicClient: viemClient,
  });

  try {
    newToken.svg = await contractUsingViem.read.getSVG([BigInt(token_id)]);
  } catch (err) {
    context.log.error(
      `Failed to fetch svg for ${project_name} ${token_id} from blockchain`,
      err,
    );
  }

  if (!newToken.svg) {
    throw new Error(`No svg for ${project_name} ${token_id}`);
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

export const processBlonksEvent = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
): ProcessEventReturn => {
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
    abi: blonksAbi,
    publicClient: viemClient,
  });

  try {
    token.svg = await contractUsingViem.read.getSVG([BigInt(token_id)]);
  } catch (err) {
    context.log.error(
      `Failed to fetch svg for ${project_name} ${token_id} from blockchain`,
      err,
    );
  }

  try {
    const pngs = await svgToPngAndUpload(token.svg!, project_id, project_slug, token_id);

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
