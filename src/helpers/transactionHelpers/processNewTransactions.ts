import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Contract } from "web3-eth-contract";

import type { IProject, ITransaction } from "../../db/schemas/schemaTypes";

import { checkIfTokenExists } from "../../db/queries/tokenQueries";
import { ProjectSlug } from "../../projects";
import { fetchScriptInputs } from "../../web3/web3Fetches";
import {
  getProcessEventFunction,
  getProcessMintFunction,
} from "../tokenHelpers";

export interface LogValues {
  currentSupply: number;
  newTokens: number[];
  numOfTxsAdded: number;
  project_name: string;
}

export const processNewTransactions = async (
  newTxs: (ITransaction | null)[],
  project: IProject,
  contract: Contract,
  context: Context,
  conn: Connection,
) => {
  const {
    devParams: { isBulkMint, usesScriptInputs },
    events,
    project_slug,
  } = project;
  const newTokenIds: number[] = [];

  for await (const tx of newTxs) {
    if (!tx) continue;

    const { event_type, token_id } = tx;
    const script_inputs =
      usesScriptInputs && token_id ?
        await fetchScriptInputs(contract, token_id)
      : undefined;

    if (event_type === "Mint") {
      if (isBulkMint) continue;

      if (!token_id) {
        if (project_slug !== ProjectSlug["100x10x1-a-goerli"]) {
          context.log.error(
            `Error processing new mint for ${project.project_name}, no token_id.`,
          );
        }
        continue;
      }

      const doesTokenExist = await checkIfTokenExists(
        token_id,
        project_slug,
        conn,
      );

      if (!doesTokenExist) {
        const processMint = getProcessMintFunction(project._id);
        const newMint = await processMint(
          token_id,
          project,
          context,
          conn,
          script_inputs,
        );

        if (!newMint) {
          context.log.error(
            `Error processing new mint for ${project.project_name}`,
          );
          continue;
        }

        newTokenIds.push(newMint.newTokenId);
      }
    } else {
      // this handles all other events events besides Mints
      const processEvent = getProcessEventFunction(project._id);

      if (events.length && processEvent) {
        await processEvent(
          token_id,
          project,
          context,
          conn,
          script_inputs,
          event_type,
        );
      }
    }
  }

  return newTokenIds;
};
