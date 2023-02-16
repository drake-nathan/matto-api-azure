import * as dotenv from 'dotenv';
import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../../db/schemas/schemaTypes';
import type { ProcessMintReturn, ProcessEventReturn } from '../types';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import {
  addToken,
  updateOneTokenDesc,
  updateScriptInputs,
} from '../../../db/queries/tokenQueries';
import { attributes as mathareStartingAttr } from '../../../projects/mathareData/attributes';
import mathareDescriptionsJson from '../../../projects/mathareData/descriptions.json';
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
  const image = `https://arweave.net/dtEayxAD2Aknd8g8WWyErEX37kesMRsJhbopwDYPhdo/${token_id}.png`;
  const image_mid = `https://mattoapi.blob.core.windows.net/mathare-images/mid-${token_id}.png`;
  const thumbnail_url = `https://mattoapi.blob.core.windows.net/mathare-images/thumb-${token_id}.png`;

  return { generator_url, external_url, image, image_mid, thumbnail_url };
};

export const processMathareMint = async (
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
    collection_name,
    script_type,
    aspect_ratio,
    website,
    external_url: projectExternalUrl,
    license,
    royalty_info,
    tx_count,
    appended_description,
  } = project;

  context.log.info('Adding token', token_id, 'to', project_name);

  if (!script_inputs) {
    context.log.info('No script inputs for token', token_id, 'in project', project_name);
    return;
  }

  const { generator_url, external_url, image, image_mid, thumbnail_url } = getUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const newToken: IToken = {
    token_id,
    name: `${project.project_name} ${token_id}`,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    description: `${mathareDescriptionsJson[token_id - 1]}${appended_description}`,
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
    attributes: mathareStartingAttr,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply ? previousSupply + 1 : 1,
    tx_count ? tx_count + 1 : 1,
    conn,
  );

  return { newTokenId, newSupply };
};

export const processMathareEvent = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs?: IScriptInputs,
): ProcessEventReturn => {
  const { _id: project_id, project_name } = project;

  context.log.info('Updating token', token_id, 'on', project_name);

  if (!script_inputs) {
    throw new Error(`No script inputs for ${project_name} token ${token_id}`);
  }

  const updatedToken = await updateScriptInputs(
    conn,
    project_id,
    token_id,
    script_inputs,
  );

  return updatedToken;
};

export const updateMathareDescriptions = async (conn: Connection, project: IProject) => {
  const { _id: project_id, maximum_supply, appended_description } = project;

  // create array of token ids starting from 1 to maximum_supply
  const tokenIds = Array.from(Array(maximum_supply).keys()).map((i) => i + 1);

  await Promise.all(
    tokenIds.map(async (token_id) => {
      const newDescription = `${
        mathareDescriptionsJson[token_id - 1]
      }${appended_description}`;

      await updateOneTokenDesc(conn, project_id, token_id, newDescription);
    }),
  );
};