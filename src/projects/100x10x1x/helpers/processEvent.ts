import { isAddress } from "viem";

import type { ProcessEventFunction } from "../../../helpers/tokenHelpers/types";

import { triggerCompositeUpdate } from "../../../services/fetchCompositeUpdate";
import { updateTokenInDb } from "./updateTokenInDb";

export const process100xEvent: ProcessEventFunction = async (
  token_id,
  project,
  context,
  conn,
  script_inputs,
  event_type,
) => {
  if (event_type === "Transfer") return null;

  context.log.info(
    `ProcessEvent: Processing ${event_type} for ${project.project_name}.`,
  );

  const {
    chain,
    collection_description,
    contract_address: contractAddress,
  } = project;

  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  // lazy update composite image
  void triggerCompositeUpdate({ projectSlug: project.project_slug });

  const updatedToken = await updateTokenInDb({
    chain,
    collectionDescription: collection_description,
    conn,
    context,
    contractAddress,
    project,
    tokenId: 0,
  });

  return updatedToken;
};
