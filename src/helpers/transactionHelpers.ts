import { type Context } from "@azure/functions";
import { type Connection } from "mongoose";
import { type Contract } from "web3-eth-contract";

import type { IProject, ITransaction } from "../db/schemas/schemaTypes";

import { getProjectCurrentSupply } from "../db/queries/projectQueries";
import { checkIfTokenExists } from "../db/queries/tokenQueries";
import { addTransaction } from "../db/queries/transactionQueries";
import { ProjectSlug, abis } from "../projects";
import { getContractWeb3 } from "../web3/contractWeb3";
import { getWeb3 } from "../web3/providers";
import { fetchEvents, fetchScriptInputs } from "../web3/web3Fetches";
import {
  getProcessEventFunction,
  getProcessMintFunction,
} from "./tokenHelpers";

export interface ILogValues {
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
      usesScriptInputs && token_id
        ? await fetchScriptInputs(contract, token_id)
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

export const checkForNewTransactions = async (
  project: IProject,
  context: Context,
  conn: Connection | undefined,
) => {
  const {
    _id: project_id,
    chain,
    contract_address,
    creation_block,
    events,
    project_name,
  } = project;
  context.log(`Checking for new transactions for ${project_name}...`);
  const web3 = getWeb3(chain);
  const contract = getContractWeb3(web3, abis[project_id], contract_address);

  const logValues: ILogValues = {
    currentSupply: 0,
    newTokens: [],
    numOfTxsAdded: 0,
    project_name,
  };

  if (!conn) {
    throw new Error("No connection to database. (checkForNewTransactions)");
  }

  const { filteredTransactions: fetchedTransactions } = await fetchEvents(
    contract,
    events,
    project_id,
    conn,
    creation_block,
  );

  const newTransactionsAdded = await Promise.all(
    fetchedTransactions.map(async (tx) =>
      addTransaction(tx, project_id, conn, chain),
    ),
  );
  const newTxNoNull = newTransactionsAdded.filter(Boolean);

  if (newTxNoNull.length) {
    context.log.info(
      `${newTxNoNull.length} missing transactions found and added.`,
    );
  } else {
    const currentSupply = await getProjectCurrentSupply(project._id, conn);
    logValues.currentSupply = currentSupply;
    return logValues;
  }

  logValues.numOfTxsAdded = newTxNoNull.length;

  const newTokenIds = await processNewTransactions(
    newTxNoNull,
    project,
    contract,
    context,
    conn,
  );
  logValues.newTokens = newTokenIds;

  const newSupply = await getProjectCurrentSupply(project._id, conn);
  logValues.currentSupply = newSupply;

  return logValues;
};
