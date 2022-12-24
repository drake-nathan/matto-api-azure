import * as dotenv from 'dotenv';
import { Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { IProject, IScriptInputs, IToken } from '../../db/schemas/schemaTypes';
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../db/queries/projectQueries';
import {
  addToken,
  getToken,
  updateTokenMetadataOnTransfer,
} from '../../db/queries/tokenQueries';
import { attributes as mathareStartingAttr } from '../../projects/mathareData/attributes';
import descriptionsJson from '../../projects/mathareData/descriptions.json';

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getUrls = (project_slug: string, token_id: number, rootExternalUrl: string) => {
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

  const { generator_url, external_url, image, image_mid, thumbnail_url } = getUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const appendedDesc = `\n\n**Interactivity:**\n\nPress 'P' or long press/click & release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Press '<' or '>' to change the brightness of the matte displayed behind the image.`;

  const newToken: IToken = {
    token_id,
    name: `${project.project_name} ${token_id}`,
    project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    description: `${descriptionsJson[token_id - 1]}${appendedDesc}`,
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
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => {
  context.log.info('Updating token', token_id, 'on', project.project_name);
  const { _id: project_id, project_slug } = project;

  const token = await getToken(project_slug, token_id, conn);
  const { image, thumbnail_url, attributes } = token;

  const transferAttrIndex = attributes.findIndex(
    (attr) => attr.trait_type === 'Transfer Count',
  );
  attributes[transferAttrIndex].value = script_inputs.transfer_count;

  const updatedToken = await updateTokenMetadataOnTransfer(
    project_id,
    token_id,
    script_inputs,
    image,
    thumbnail_url,
    attributes,
    conn,
  );

  return updatedToken;
};
