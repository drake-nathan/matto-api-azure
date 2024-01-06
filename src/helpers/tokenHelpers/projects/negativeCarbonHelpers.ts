import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";

import * as dotenv from "dotenv";

import type {
  IProject,
  IScriptInputs,
  IToken,
} from "../../../db/schemas/schemaTypes";
import type { ProjectSlug } from "../../../projects";
import type { ProcessEventFunction, ProcessMintReturn } from "../types";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken, updateScriptInputs } from "../../../db/queries/tokenQueries";
import { getPuppeteerImageSet } from "../../../services/puppeteer";

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getNegativeCarbonUrls = (
  project_slug: ProjectSlug,
  token_id: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${project_slug}/generator/${token_id}`;
  const external_url = `${rootExternalUrl}/token/${token_id}`;

  return { external_url, generator_url };
};

export const processNegativeCarbonMint = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs?: IScriptInputs,
): ProcessMintReturn => {
  const {
    _id: project_id,
    artist,
    artist_address,
    aspect_ratio,
    collection_description,
    collection_name,
    external_url: projectExternalUrl,
    license,
    project_name,
    project_slug,
    royalty_info,
    script_type,
    tx_count,
    website,
  } = project;

  context.log.info("Adding token", token_id, "to", project.project_name);

  if (!script_inputs) {
    throw new Error(`No script inputs for ${project_name} token ${token_id}`);
  }

  const { external_url, generator_url } = getNegativeCarbonUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const { attributes, image, image_mid, image_small } =
    await getPuppeteerImageSet(
      project_id,
      project_slug,
      token_id,
      generator_url,
      script_inputs,
    );

  const newToken: IToken = {
    animation_url: generator_url,
    artist,
    artist_address,
    aspect_ratio,
    attributes,
    collection_name,
    description: collection_description,
    external_url,
    generator_url,
    image,
    image_mid,
    image_small,
    license,
    name: `${project_name} ${token_id}`,
    project_id,
    project_name,
    project_slug,
    royalty_info,
    script_inputs,
    script_type,
    token_id,
    website,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply + 1,
    tx_count + 1,
    conn,
  );

  return { newSupply, newTokenId };
};

export const processNegativeCarbonEvent: ProcessEventFunction = async (
  token_id,
  project,
  context,
  conn,
  script_inputs,
) => {
  const { _id: project_id, project_name } = project;

  context.log.info("Updating token", token_id, "on", project_name);

  if (!script_inputs) {
    throw new Error(`No script inputs for ${project_name} token ${token_id}`);
  }

  if (!token_id) {
    throw new Error(
      `No token id for ${project_name}, (processNegativeCarbonEvent)`,
    );
  }

  const updatedToken = await updateScriptInputs(
    conn,
    project_id,
    token_id,
    script_inputs,
  );

  return updatedToken;
};
