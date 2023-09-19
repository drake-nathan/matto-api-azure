import type { ProcessEventFunction } from "../../../helpers/tokenHelpers/types";
import { getTokenZeroDescription } from "./getTokenZeroDescription";
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
    _id: project_id,
    project_name,
    project_slug,
    chain,
    contract_address,
    collection_description,
  } = project;

  if (event_type === "Transfer") return null;

  const description = await getTokenZeroDescription(
    chain,
    contract_address,
    collection_description,
  );

  const updatedToken = await updateTokenInDb({
    chain,
    conn,
    context,
    contractAddress: contract_address,
    description,
    projectId: project_id,
    projectName: project_name,
    projectSlug: project_slug,
    tokenId: 0,
  });

  return updatedToken;
};
