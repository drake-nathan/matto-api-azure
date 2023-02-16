import * as dotenv from 'dotenv';
import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { IProject, IToken } from '../../../db/schemas/schemaTypes';
import type { ProcessMintReturn } from '../types';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import { addToken } from '../../../db/queries/tokenQueries';
import { fetchResizeUploadImages } from '../../../services/images';
import { fetchBase64Textures } from '../../../web3/blockchainFetches';
import { Chain, abis } from '../../../projects';
import { getContract } from '../../../web3/contract';
import { getWeb3 } from '../../../web3/provider';

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getTexturesUrls = (
  projectSlug: string,
  tokenId: number,
  rootExternalUrl: string,
) => {
  const external_url = `${rootExternalUrl}/token/${tokenId}`;
  const image = `https://mattoapi.blob.core.windows.net/texture-and-hues-images/${tokenId}.png`;
  const svgGen = `${rootServerUrl}/project/${projectSlug}/svg/${tokenId}`;

  return { external_url, image, svgGen };
};

export const processTexturesMint = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
): ProcessMintReturn => {
  const {
    _id: project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    collection_description,
    collection_name,
    script_type,
    aspect_ratio,
    website,
    external_url: projectExternalUrl,
    license,
    royalty_info,
    tx_count,
  } = project;

  context.log.info('Adding token', token_id, 'to', project.project_name);

  const { external_url, image, svgGen } = getTexturesUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const { image_mid, image_small } = await fetchResizeUploadImages(
    project_id,
    project_slug,
    token_id,
    image,
  );

  const web3 = getWeb3(Chain.mainnet);
  const contract = getContract(web3, abis[project._id], project.contract_address);

  const { attributes, svg } = await fetchBase64Textures(contract, token_id, context);

  const name = `${project_name} #${token_id}`;

  const newToken: IToken = {
    token_id,
    name,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    description: collection_description,
    collection_name,
    aspect_ratio,
    script_type,
    image,
    image_mid,
    image_small,
    svg,
    svgGen,
    external_url,
    website,
    license,
    royalty_info,
    attributes,
  };

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
