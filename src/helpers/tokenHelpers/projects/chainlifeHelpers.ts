import * as dotenv from 'dotenv';
import { type Context } from '@azure/functions';
import { type Connection } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../../db/schemas/schemaTypes';
import type { ProcessMintReturn, ProcessEventReturn } from '../types';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import {
  addToken,
  getAllTokensFromProject,
  updateTokenMetadataOnTransfer,
} from '../../../db/queries/tokenQueries';
import { getPuppeteerImageSet } from '../../../services/puppeteer';
import { ProjectSlug } from '../../../projects';

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getUrls = (
  project_slug: ProjectSlug,
  token_id: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${project_slug}/generator/${token_id}`;
  const external_url = `${rootExternalUrl}/token/${token_id}`;

  return { generator_url, external_url };
};

export const processChainlifeMint = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs?: IScriptInputs,
): ProcessMintReturn => {
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

  context.log.info('Adding token', token_id, 'to', project_name);

  if (!script_inputs) {
    throw new Error(`No script inputs for ${project_name} token ${token_id}`);
  }

  const { generator_url, external_url } = getUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const regex = /esoterra/gi;
  const puppeteerGenUrl = script_inputs.custom_rule?.match(regex)
    ? `${generator_url}?esoterra=true`
    : generator_url;

  const { image, image_mid, image_small, attributes } = await getPuppeteerImageSet(
    project_id,
    project_slug,
    token_id,
    puppeteerGenUrl,
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
    description: description || '',
    collection_name,
    aspect_ratio,
    script_type,
    script_inputs,
    image,
    image_mid,
    image_small,
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

export const processChainlifeEvent = async (
  token_id: number | undefined,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs: IScriptInputs | null,
): ProcessEventReturn => {
  const { _id: project_id, project_name, project_slug, external_url } = project;

  context.log.info('Updating token', token_id, 'on', project.project_name);

  if (!script_inputs) {
    throw new Error(`No script inputs for ${project_name} token ${token_id}`);
  }

  if (!token_id) {
    throw new Error(`No token id for ${project_name}, (processChainlifeEvent)`);
  }

  const { generator_url } = getUrls(project_slug, token_id, external_url);

  const regex = /esoterra/gi;
  const puppeteerGenUrl = script_inputs.custom_rule?.match(regex)
    ? `${generator_url}?esoterra=true`
    : generator_url;

  const { image, image_mid, image_small, attributes } = await getPuppeteerImageSet(
    project_id,
    project_slug,
    token_id,
    puppeteerGenUrl,
    script_inputs,
  );

  const updatedToken = await updateTokenMetadataOnTransfer(
    project_id,
    token_id,
    script_inputs,
    image,
    image_mid,
    image_small,
    attributes,
    conn,
  );

  return updatedToken;
};

export const checkIfTokensMissingAttributes = async (
  project_slug: ProjectSlug,
  conn: Connection,
) => {
  const allTokens = await getAllTokensFromProject(project_slug, conn);

  const tokensMissingAttributes = allTokens.filter((token) => !token.attributes);
  const numOfBadTokens = tokensMissingAttributes.length;

  return { tokensMissingAttributes, numOfBadTokens };
};

export const repairBadTokens = async (
  project: IProject,
  bumTokens: IToken[],
  context: Context,
  conn: Connection,
) => {
  const updatedTokens: any[] = [];

  for await (const token of bumTokens) {
    const { token_id, script_inputs } = token;
    const updatedToken = await processChainlifeEvent(
      token_id,
      project,
      context,
      conn,
      script_inputs!,
    );

    if (!updatedToken) {
      context.log.error('Failed to update token', token_id);
      continue;
    }

    updatedTokens.push(updatedToken);
  }

  const numOfRemainingBadTokens = updatedTokens.filter(
    (token) => !token.attributes,
  ).length;

  return numOfRemainingBadTokens;
};
