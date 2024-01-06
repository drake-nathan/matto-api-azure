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
import {
  addToken,
  getAllTokensFromProject,
  updateTokenMetadataOnTransfer,
} from "../../../db/queries/tokenQueries";
import { getPuppeteerImageSet } from "../../../services/puppeteer";

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getUrls = (
  project_slug: ProjectSlug,
  token_id: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${project_slug}/generator/${token_id}`;
  const external_url = `${rootExternalUrl}/token/${token_id}`;

  return { external_url, generator_url };
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
    artist,
    artist_address,
    aspect_ratio,
    collection_name,
    description,
    external_url: projectExternalUrl,
    license,
    project_name,
    project_slug,
    royalty_info,
    script_type,
    tx_count,
    website,
  } = project;

  context.log.info("Adding token", token_id, "to", project_name);

  if (!script_inputs) {
    throw new Error(`No script inputs for ${project_name} token ${token_id}`);
  }

  const { external_url, generator_url } = getUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const regex = /esoterra/gi;
  const puppeteerGenUrl = script_inputs.custom_rule?.match(regex)
    ? `${generator_url}?esoterra=true`
    : generator_url;

  const { attributes, image, image_mid, image_small } =
    await getPuppeteerImageSet(
      project_id,
      project_slug,
      token_id,
      puppeteerGenUrl,
      script_inputs,
    );

  const newToken: IToken = {
    animation_url: generator_url,
    artist,
    artist_address,
    aspect_ratio,
    attributes,
    collection_name,
    description: description || "",
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

export const processChainlifeEvent: ProcessEventFunction = async (
  token_id,
  project,
  context,
  conn,
  script_inputs,
) => {
  const { _id: project_id, external_url, project_name, project_slug } = project;

  context.log.info("Updating token", token_id, "on", project.project_name);

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

  const { attributes, image, image_mid, image_small } =
    await getPuppeteerImageSet(
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

  const tokensMissingAttributes = allTokens.filter(
    (token) => !token.attributes.length,
  );
  const numOfBadTokens = tokensMissingAttributes.length;

  return { numOfBadTokens, tokensMissingAttributes };
};

export const repairBadTokens = async (
  project: IProject,
  bumTokens: IToken[],
  context: Context,
  conn: Connection,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedTokens: any[] = [];

  for await (const token of bumTokens) {
    const { script_inputs, token_id } = token;
    const updatedToken = await processChainlifeEvent(
      token_id,
      project,
      context,
      conn,
      script_inputs,
    );

    if (!updatedToken) {
      context.log.error("Failed to update token", token_id);
      continue;
    }

    updatedTokens.push(updatedToken);
  }

  const numOfRemainingBadTokens = updatedTokens.filter(
    (token) => !token.attributes,
  ).length;

  return numOfRemainingBadTokens;
};
