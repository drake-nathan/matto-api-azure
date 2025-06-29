import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Address } from "viem";
import type { Contract } from "web3-eth-contract";

import type { IProject } from "../../db/schemas/schemaTypes";

import {
  addTransaction,
  updateLastProcessedBlock,
} from "../../db/queries/transactionQueries";
import { fetchEvents } from "../../web3/fetches/fetchEvents";
import { processNewTransactions } from "../transactionHelpers/processNewTransactions";

interface ReconcileTransactionsParams {
  conn: Connection;
  context: Context;
  contract: Contract;
  functionName?: string;
  maxBlocksPerInvocation?: number;
  project: IProject;
}

export const reconcileTransactions = async ({
  conn,
  context,
  contract,
  functionName,
  maxBlocksPerInvocation = 50000,
  project,
}: ReconcileTransactionsParams) => {
  const { _id: project_id, events, project_name } = project;

  const contractAddress = project.contract_address as Address;

  const {
    err,
    filteredTransactions,
    hasMoreBlocks,
    lastProcessedBlock,
    totalTxCount,
  } = await fetchEvents({
    chain: project.chain,
    conn,
    context,
    contractAddress,
    creationBlock: project.creation_block,
    events,
    functionName,
    maxBlocksPerInvocation,
    projectId: project_id,
  });

  if (err) {
    context.log.error(`[reconcileTransactions - ${project_name}] ${err}`);
    return { allTransactions: [], hasMoreBlocks: false, totalTxCount: 0 };
  }

  context.log.info(
    `[reconcileTransactions - ${project_name}] Got ${filteredTransactions.length} filtered transactions`,
  );

  if (hasMoreBlocks) {
    context.log.info(
      `[reconcileTransactions - ${project_name}] More blocks available for processing. Processed up to block ${lastProcessedBlock}`,
    );
  } else {
    context.log.info(
      `[reconcileTransactions - ${project_name}] Fully caught up to latest block ${lastProcessedBlock}`,
    );
  }

  // Add transactions to the database
  const newTransactionsAdded = await Promise.all(
    filteredTransactions.map((tx) => addTransaction(tx, project_id, conn)),
  );

  // Update the last processed block in the database
  if (lastProcessedBlock !== undefined) {
    const updateSuccess = await updateLastProcessedBlock(
      project_id,
      lastProcessedBlock,
      conn,
    );
    if (updateSuccess) {
      context.log.info(
        `[reconcileTransactions - ${project_name}] Updated last processed block to ${lastProcessedBlock}`,
      );
    } else {
      context.log.warn(
        `[reconcileTransactions - ${project_name}] Failed to update last processed block`,
      );
    }
  }

  return {
    allTransactions: filteredTransactions,
    hasMoreBlocks: hasMoreBlocks || false,
    lastProcessedBlock,
    totalTxCount,
  };
};
