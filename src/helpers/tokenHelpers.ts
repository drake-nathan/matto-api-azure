import * as dotenv from 'dotenv';
import { Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { IProject, IScriptInputs, IToken } from '../db/schemas/schemaTypes';
import {
  getProjectCurrentSupply,
  updateProjectCurrentSupply,
} from '../db/queries/projectQueries';
import {
  addToken,
  checkIfTokenExists,
  updateTokenMetadataOnTransfer,
} from '../db/queries/tokenQueries';
import { runPuppeteer } from '../utils/puppeteer';
import { uploadThumbnail } from '../utils/azureImageUpload';

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

export const processNewTokenMint = async (
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
    website,
    license,
    royalty_info,
  } = project;

  const doesTokenExist = await checkIfTokenExists(token_id, conn);
  if (doesTokenExist) return;

  context.log.info('Adding token', token_id, 'to', project.project_name);

  const generator_url = `${rootServerUrl}/project/${project_slug}/generator/${token_id}`;

  const { screenshot, attributes } = await runPuppeteer(generator_url, script_inputs);

  const image = await uploadThumbnail(screenshot, project_slug, token_id);

  const newToken: IToken = {
    token_id,
    name: `${project.project_name} ${token_id}`,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    description,
    collection_name,
    aspect_ratio: 1,
    script_type,
    script_inputs,
    image,
    generator_url,
    animation_url: generator_url,
    external_url: generator_url,
    website,
    license,
    royalty_info,
    attributes,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectCurrentSupply(
    project_id,
    previousSupply + 1,
    conn,
  );

  return { newTokenId, newSupply };
};

export const processTransferEvent = async (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => {
  context.log.info('Updating token', token_id, 'on', project.project_name);

  const { _id: project_id, project_slug } = project;
  const generator_url = `${rootServerUrl}/project/${project_id}/generator/${token_id}`;

  const { screenshot, attributes } = await runPuppeteer(generator_url, script_inputs);

  await uploadThumbnail(screenshot, project_slug, token_id);

  await updateTokenMetadataOnTransfer(
    project_id,
    token_id,
    script_inputs,
    attributes,
    conn,
  );
};
