import { isAddress } from "viem";

import type { ProcessEventFunction } from "../../../helpers/tokenHelpers/types";
import { fetchCompositeUpdate } from "../../../services/fetchCompositeUpdate";
import { updateTokenInDb } from "./updateTokenInDb";

export const process100xEvent: ProcessEventFunction = async (
  token_id,
  project,
  context,
  conn,
  script_inputs,
  event_type,
) => {
  context.log.info(
    `ProcessEvent: Processing ${event_type} for ${project.project_name}.`,
  );

  const {
    chain,
    contract_address: contractAddress,
    collection_description,
  } = project;

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  if (event_type === "Transfer") return null;

  // lazy update composite image
  fetchCompositeUpdate({ projectSlug: project.project_slug });

  const updatedToken = await updateTokenInDb({
    chain,
    conn,
    context,
    contractAddress,
    collectionDescription: collection_description,
    project,
    tokenId: 0,
  });

  return updatedToken;
};
