import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { getContract as getContractViem } from "viem";

import type { IProject, IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessEventReturn, ProcessMintFunction } from "../types";

import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken, getTokenDoc } from "../../../db/queries/tokenQueries";
import { blonksAbi } from "../../../projects/abis/blonksAbi";
import { svgToPngAndUpload } from "../../../services/images";
import { getViem } from "../../../web3/providers";
import { allBLONKStraits } from "../../constants";

export const processBlonksMint: ProcessMintFunction = async (
  token_id,
  project,
  context,
  conn,
) => {
  const {
    _id: project_id,
    artist,
    artist_address,
    aspect_ratio,
    chain,
    collection_name,
    contract_address,
    description,
    external_url,
    license,
    project_name,
    project_slug,
    royalty_info,
    script_type,
    tx_count,
    website,
  } = project;

  context.log.info("Adding token", token_id, "to", project_name);

  const newToken: IToken = {
    artist,
    artist_address,
    aspect_ratio,
    attributes: allBLONKStraits[token_id],
    collection_name,
    description: description || "",
    external_url,
    image: "",
    license,
    name: `BLONK #${token_id}`,
    project_id,
    project_name,
    project_slug,
    royalty_info,
    script_type,
    token_id,
    website,
  };

  const viemClient = getViem(chain);

  const contractUsingViem = getContractViem({
    abi: blonksAbi,
    address: contract_address as `0x${string}`,
    publicClient: viemClient,
  });

  try {
    newToken.svg = await contractUsingViem.read.getSVG([BigInt(token_id)]);
  } catch (err) {
    context.log.error(
      `Failed to fetch svg for ${project_name} ${token_id} from blockchain`,
      err,
    );
  }

  if (!newToken.svg) {
    throw new Error(`No svg for ${project_name} ${token_id}`);
  }

  try {
    const pngs = await svgToPngAndUpload(
      newToken.svg,
      project_id,
      project_slug,
      token_id,
    );

    newToken.image = pngs.image;
    newToken.image_mid = pngs.image_mid;
    newToken.image_small = pngs.image_small;
  } catch (err) {
    context.log.error(
      `Failed to convert svg to png and upload for ${project_name} ${token_id}`,
      err,
    );
  }

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

export const processBlonksEvent = async (
  token_id: number | undefined,
  project: IProject,
  context: Context,
  conn: Connection,
): ProcessEventReturn => {
  const {
    _id: project_id,
    chain,
    contract_address,
    project_name,
    project_slug,
  } = project;

  if (!token_id) {
    throw new Error(`No token_id for ${project_name}, (processBlonksEvent)`);
  }

  const token = await getTokenDoc(project_slug, token_id, conn);

  if (!token) {
    throw new Error(`No token found for ${project_name} ${token_id}`);
  }

  const viemClient = getViem(chain);

  const contractUsingViem = getContractViem({
    abi: blonksAbi,
    address: contract_address as `0x${string}`,
    publicClient: viemClient,
  });

  try {
    token.svg = await contractUsingViem.read.getSVG([BigInt(token_id)]);
  } catch (err) {
    context.log.error(
      `Failed to fetch svg for ${project_name} ${token_id} from blockchain`,
      err,
    );
  }

  if (!token.svg) {
    throw new Error(`No svg for ${project_name} ${token_id}`);
  }

  try {
    const pngs = await svgToPngAndUpload(
      token.svg,
      project_id,
      project_slug,
      token_id,
    );

    token.image = pngs.image;
    token.image_mid = pngs.image_mid;
    token.image_small = pngs.image_small;
  } catch (err) {
    context.log.error(
      `Failed to convert svg to png and upload for ${project_name} ${token_id}`,
      err,
    );
  }

  const updatedToken = await token.save();

  return updatedToken;
};
