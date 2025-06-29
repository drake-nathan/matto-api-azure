import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Address } from "viem";
import type { Contract } from "web3-eth-contract";

import type { IProject } from "../../db/schemas/schemaTypes";

import { addTransaction } from "../../db/queries/transactionQueries";
import { fetchEvents } from "../../web3/fetches/fetchEvents";
import { processNewTransactions } from "../transactionHelpers/processNewTransactions";

interface ReconcileTransactionsParams {
  conn: Connection;
  context: Context;
  contract: Contract;
  functionName?: string;
  project: IProject;
}

export const reconcileTransactions = async ({
  conn,
  context,
  contract,
  functionName,
  project,
}: ReconcileTransactionsParams) => {
  const { _id: project_id, events } = project;

  const contractAddress = project.contract_address as Address;

  const { err, filteredTransactions, totalTxCount } = await fetchEvents({
    chain: project.chain,
    conn,
    context,
    contractAddress,
    creationBlock: project.creation_block,
    events,
    functionName,
    projectId: project_id,
  });

  if (err) {
    context.log.error(err);
    return { allTransactions: [], totalTxCount: 0 };
  }

  context.log.info(
    `[reconcileTransactions - ${project.project_name}] Got ${filteredTransactions.length} filtered transactions`,
  );

  // Add transactions to the database
  await Promise.all(
    filteredTransactions.map((tx) => addTransaction(tx, project_id, conn)),
  );

  return { allTransactions: filteredTransactions, totalTxCount };
};
