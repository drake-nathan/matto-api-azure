import type { Context } from "@azure/functions";
import * as dotenv from "dotenv";
import type { Connection } from "mongoose";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken, updateScriptInputs } from "../../../db/queries/tokenQueries";
import type {
  IProject,
  IScriptInputs,
  IToken,
} from "../../../db/schemas/schemaTypes";
import { ProjectSlug } from "../../../projects";
import { getPuppeteerImageSet } from "../../../services/puppeteer";
import type { ProcessEventFunction, ProcessMintReturn } from "../types";

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getNegativeCarbonUrls = (
  project_slug: ProjectSlug,
  token_id: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${project_slug}/generator/${token_id}`;
  const external_url = `${rootExternalUrl}/token/${token_id}`;

  return { generator_url, external_url };
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

  context.log.info("Adding token", token_id, "to", project.project_name);

  if (!script_inputs) {
    throw new Error(`No script inputs for ${project_name} token ${token_id}`);
  }

  const { generator_url, external_url } = getNegativeCarbonUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const { image, image_mid, image_small, attributes } =
    await getPuppeteerImageSet(
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
    description: collection_description,
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
