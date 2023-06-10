import * as dotenv from 'dotenv';
import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../../db/schemas/schemaTypes';
import type { ProcessMintReturn } from '../../../helpers/tokenHelpers/types';
import { ProjectSlug } from '../..';

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from '../../../db/queries/projectQueries';
import { addToken } from '../../../db/queries/tokenQueries';

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getUrls = (
  project_slug: ProjectSlug,
  token_id: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${project_slug}/generator/${token_id}`;
  const external_url = `${rootExternalUrl}/token/${token_id}`;
  const image = `test.png`;
  return { generator_url, external_url, image };
};

export const processMfaMint = async (
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
    description,
  } = project;

  context.log.info('Adding token', token_id, 'to', project_name);

  if (!script_inputs) {
    context.log.info('No script inputs for token', token_id, 'in project', project_name);
    return;
  }

  const { generator_url, external_url, image } = getUrls(
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
    description: description ?? '',
    collection_name,
    aspect_ratio,
    script_type,
    script_inputs,
    image,
    generator_url,
    animation_url: generator_url,
    external_url,
    website,
    license,
    royalty_info,
    attributes: [{ trait_type: 'Minted', value: 'true' }],
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
