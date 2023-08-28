import type { ProcessEventFunction } from "../../../helpers/tokenHelpers/types";
import { getTokenZeroDescription } from "./getTokenZeroDescription";
import { updateTokenInDb } from "./updateTokenInDb";

export const process100xEvent: ProcessEventFunction = async (
  token_id,
  project,
  context,
  conn,
) => {
  const {
    _id: project_id,
    project_name,
    project_slug,
    chain,
    contract_address,
    collection_description,
  } = project;

  // if token_id is undefined, then it's a NewOrder event, update 0
  const tokenId = token_id ?? 0;

  const description =
    tokenId === 0
      ? await getTokenZeroDescription(
          chain,
          contract_address,
          collection_description,
        )
      : collection_description;

  const updatedToken = await updateTokenInDb({
    chain,
    conn,
    context,
    contractAddress: contract_address,
    description,
    projectId: project_id,
    projectName: project_name,
    projectSlug: project_slug,
    tokenId,
  });

  return updatedToken;
};
