import * as dotenv from 'dotenv';
import { type Context } from '@azure/functions';
import { type Connection } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../../db/schemas/schemaTypes';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import {
  addToken,
  checkIfTokenExists,
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

  context.log.info('Adding token', token_id, 'to', project_name);

  const { generator_url, external_url } = getUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const regex = /esoterra/gi;
  const puppeteerGenUrl = script_inputs.custom_rule?.match(regex)
    ? `${generator_url}?esoterra=true`
    : generator_url;

  const { image, image_mid, thumbnail_url, attributes } = await getPuppeteerImageSet(
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

export const processChainlifeEvent = async (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => {
  context.log.info('Updating token', token_id, 'on', project.project_name);

  const { _id: project_id, project_slug, external_url } = project;
  const { generator_url } = getUrls(project_slug, token_id, external_url);

  const regex = /esoterra/gi;
  const puppeteerGenUrl = script_inputs.custom_rule?.match(regex)
    ? `${generator_url}?esoterra=true`
    : generator_url;

  const { image, image_mid, thumbnail_url, attributes } = await getPuppeteerImageSet(
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
    thumbnail_url,
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
  const updatedTokens: IToken[] = [];

  for await (const token of bumTokens) {
    const { token_id, script_inputs } = token;
    const updatedToken = await processChainlifeEvent(
      token_id,
      project,
      script_inputs,
      context,
      conn,
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
