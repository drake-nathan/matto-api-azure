import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";

import * as dotenv from "dotenv";

import type {
  IProject,
  IScriptInputs,
  IToken,
} from "../../../db/schemas/schemaTypes";
import type { ProcessMintReturn } from "../types";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import { fetchResizeUploadImages } from "../../../services/images";
import { getAttributes } from "../../../services/puppeteer";

dotenv.config();
const rootServerUrl = process.env.ROOT_URL;

const getCrystallizedIllusionsUrls = (
  projectSlug: string,
  tokenId: number,
  rootExternalUrl: string,
) => {
  const generator_url = `${rootServerUrl}/project/${projectSlug}/generator/${tokenId}`;
  const external_url = `${rootExternalUrl}/token/${tokenId}`;
  const image = `https://arweave.net/Mduh0JQesPrHJbyLcJLBDmXF368mbQqNF68V78DIMoI/${tokenId}.png`;

  return { external_url, generator_url, image };
};

export const processCrystallizedIllusionsMint = async (
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

  const { external_url, generator_url, image } = getCrystallizedIllusionsUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const [image_mid, image_small] = await fetchResizeUploadImages(
    project_id,
    project_slug,
    token_id,
    image,
  );

  const attributes = await getAttributes(generator_url, script_inputs);

  const type = attributes.find((attr) => attr.trait_type === "Type")?.value;
  const complexity = attributes.find((attr) => attr.trait_type === "Complexity")
    ?.value;

  const name =
    type && complexity
      ? `${type} #${complexity}`
      : `${project_name} ${token_id}`;

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
    name,
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
