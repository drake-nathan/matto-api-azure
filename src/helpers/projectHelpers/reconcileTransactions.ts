import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Contract } from "web3-eth-contract";

import type { IProject } from "../../db/schemas/schemaTypes";

import { addTransaction } from "../../db/queries/transactionQueries";
import { fetchEvents } from "../../web3/fetches/fetchEvents";
import { processNewTransactions } from "../transactionHelpers";

export const reconcileTransactions = async (
  conn: Connection,
  context: Context,
  project: IProject,
  contract: Contract,
) => {
  const { _id: project_id, chain, creation_block, events } = project;

  const { filteredTransactions: allTransactions, totalTxCount } =
    await fetchEvents({
      conn,
      contract,
      creationBlock: creation_block,
      events,
      fetchAll: true,
      projectId: project_id,
    });

  const newTransactionsAdded = await Promise.all(
    allTransactions.map((tx) => addTransaction(tx, project_id, conn, chain)),
  );

  await processNewTransactions(
    newTransactionsAdded,
    project,
    contract,
    context,
    conn,
  );

  return { allTransactions, totalTxCount };
};
