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
  updateOneTokenDesc,
  updateScriptInputs,
} from "../../../db/queries/tokenQueries";
import { attributes as mathareStartingAttr } from "../../../projects/mathareData/attributes";
import mathareDescriptionsJson from "../../../projects/mathareData/descriptions.json";

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

  return { external_url, generator_url, image, image_mid, thumbnail_url };
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
    appended_description,
    artist,
    artist_address,
    aspect_ratio,
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

  context.log.info("Adding token", token_id, "to", project_name);

  if (!script_inputs) {
    context.log.info(
      "No script inputs for token",
      token_id,
      "in project",
      project_name,
    );
    return;
  }

  const { external_url, generator_url, image, image_mid, thumbnail_url } =
    getUrls(project_slug, token_id, projectExternalUrl);

  const newToken: IToken = {
    animation_url: generator_url,
    artist,
    artist_address,
    aspect_ratio,
    attributes: mathareStartingAttr,
    collection_name,
    description: `${
      mathareDescriptionsJson[token_id - 1]
    }${appended_description}`,
    external_url,
    generator_url,
    image,
    image_mid,
    license,
    name: `${project.project_name} ${token_id}`,
    project_id,
    project_name,
    project_slug,
    royalty_info,
    script_inputs,
    script_type,
    thumbnail_url,
    token_id,
    website,
  };

  const { token_id: newTokenId } = await addToken(newToken, conn);

  const previousSupply = await getProjectCurrentSupply(project_id, conn);
  const newSupply = await updateProjectSupplyAndCount(
    project_id,
    previousSupply ? previousSupply + 1 : 1,
    tx_count ? tx_count + 1 : 1,
    conn,
  );

  return { newSupply, newTokenId };
};

export const processMathareEvent: ProcessEventFunction = async (
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
    throw new Error(`No token id for ${project_name}, (processMathareEvent)`);
  }

  const updatedToken = await updateScriptInputs(
    conn,
    project_id,
    token_id,
    script_inputs,
  );

  return updatedToken;
};

export const updateMathareDescriptions = async (
  conn: Connection,
  project: IProject,
) => {
  const { _id: project_id, appended_description, maximum_supply } = project;

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
