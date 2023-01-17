import * as dotenv from 'dotenv';
import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../../db/schemas/schemaTypes';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import { addToken } from '../../../db/queries/tokenQueries';
import { getAttributes } from '../../../services/puppeteer';
import { fetchResizeUploadImages } from '../../../services/images';

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getCrystallizedIllusionsUrls = (
  projectSlug: string,
  tokenId: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${projectSlug}/generator/${tokenId}`;
  const external_url = `${rootExternalUrl}/token/${tokenId}`;
  const image = `https://arweave.net/Mduh0JQesPrHJbyLcJLBDmXF368mbQqNF68V78DIMoI/${tokenId}.png`;

  return { generator_url, external_url, image };
};

export const processCrystallizedIllusionsMint = async (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => {
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

  const { generator_url, external_url, image } = getCrystallizedIllusionsUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const { image_mid, thumbnail_url } = await fetchResizeUploadImages(
    project_id,
    project_slug,
    token_id,
    image,
  );

  const attributes = await getAttributes(generator_url, script_inputs);

  const type = attributes.find((attr) => attr.trait_type === 'Type')?.value;
  const complexity = attributes.find((attr) => attr.trait_type === 'Complexity')?.value;

  const name =
    type && complexity ? `${type} #${complexity}` : `${project_name} ${token_id}`;

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
    script_inputs,
    image,
    image_mid,
    thumbnail_url,
    generator_url,
    animation_url: generator_url,
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
