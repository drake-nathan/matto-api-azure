import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Address } from "viem";
import type { Contract } from "web3-eth-contract";

import type { IProject } from "../../db/schemas/schemaTypes";

import { addTransaction } from "../../db/queries/transactionQueries";
import { fetchEvents } from "../../web3/fetches/fetchEvents";
import { processNewTransactions } from "../transactionHelpers/processNewTransactions";

export const reconcileTransactions = async ({
  conn,
  context,
  contract,
  project,
}: {
  conn: Connection;
  context: Context;
  contract: Contract;
  project: IProject;
}) => {
  const {
    _id: project_id,
    chain,
    contract_address,
    creation_block,
    events,
  } = project;

  const { filteredTransactions: allTransactions, totalTxCount } =
    await fetchEvents({
      chain,
      conn,
      contractAddress: contract_address as Address,
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
