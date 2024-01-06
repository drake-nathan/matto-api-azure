import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";

import * as dotenv from "dotenv";
import { getContract } from "viem";

import type { IProject, IToken } from "../../../db/schemas/schemaTypes";
import type { ProcessMintFunction } from "../../../helpers/tokenHelpers/types";

import { ProjectSlug } from "../..";
import {
  getProjectCurrentSupply,
  updateProjectSupplyAndCount,
} from "../../../db/queries/projectQueries";
import { addToken } from "../../../db/queries/tokenQueries";
import { getViem } from "../../../web3/providers";
import { mfaAbi } from "../abi";

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
  return { external_url, generator_url, image };
};

export const processMfaMint: ProcessMintFunction = async (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
) => {
  const {
    _id: project_id,
    artist,
    artist_address,
    aspect_ratio,
    chain,
    collection_name,
    contract_address: contractAddress,
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

  // const viemClient = getViem(chain);

  // const contract = getContract({
  //   address: contractAddress as `0x${string}`,
  //   abi: mfaAbi,
  //   publicClient: viemClient,
  // });

  // const tokenData = contract.tokenDataOf([BigInt(token_id)]);

  const { external_url, generator_url, image } = getUrls(
    project_slug,
    token_id,
    projectExternalUrl,
  );

  const newToken: IToken = {
    animation_url: generator_url,
    artist,
    artist_address,
    aspect_ratio,
    attributes: [{ trait_type: "Minted", value: "true" }],
    collection_name,
    description: description ?? "",
    external_url,
    generator_url,
    image,
    license,
    name: `${project.project_name} ${token_id}`,
    project_id,
    project_name,
    project_slug,
    royalty_info,
    script_type,
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
