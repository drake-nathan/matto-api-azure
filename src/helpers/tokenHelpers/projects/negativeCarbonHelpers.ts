import * as dotenv from 'dotenv';
import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../../db/schemas/schemaTypes';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import {
  checkIfTokenExists,
  addToken,
  updateScriptInputs,
} from '../../../db/queries/tokenQueries';
import { getPuppeteerImageSet } from '../../../services/puppeteer';

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getNegativeCarbonUrls = (
  project_slug: string,
  token_id: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${project_slug}/generator/${token_id}`;
  const external_url = `${rootExternalUrl}/project/${project_slug}/token/${token_id}`;

  return { generator_url, external_url };
};

export const processNegativeCarbonMint = async (
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
    description,
    collection_name,
    script_type,
    aspect_ratio,
    website,
    external_url: projectExternalUrl,
    license,
    royalty_info,
    tx_count,
  } = project;

  const doesTokenExist = await checkIfTokenExists(token_id, project_slug, conn);
  if (doesTokenExist) {
    context.log.info(`${project_name} token ${token_id} already exists, skipping`);
    return;
  }

  context.log.info('Adding token', token_id, 'to', project.project_name);

  const { generator_url, external_url } = getNegativeCarbonUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const { image, image_mid, thumbnail_url, attributes } = await getPuppeteerImageSet(
    context,
    project_id,
    project_slug,
    token_id,
    generator_url,
    script_inputs,
  );

  const newToken: IToken = {
    token_id,
    name: `${project_name} ${token_id}`,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    description: description || `${project_name} ${token_id}`,
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

export const processNegativeCarbonEvent = async (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => {
  const { _id: project_id, project_name } = project;

  context.log.info('Updating token', token_id, 'on', project_name);

  const updatedToken = await updateScriptInputs(
    conn,
    project_id,
    token_id,
    script_inputs,
  );

  return updatedToken;
};
