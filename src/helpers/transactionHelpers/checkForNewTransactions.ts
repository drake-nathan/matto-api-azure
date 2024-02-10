import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Address } from "viem";

import type { IProject } from "../../db/schemas/schemaTypes";
import type { LogValues } from "./processNewTransactions";

import { getProjectCurrentSupply } from "../../db/queries/projectQueries";
import { addTransaction } from "../../db/queries/transactionQueries";
import { abis } from "../../projects";
import { getContractWeb3 } from "../../web3/contractWeb3";
import { fetchEvents } from "../../web3/fetches/fetchEvents";
import { getWeb3 } from "../../web3/providers";
import { processNewTransactions } from "./processNewTransactions";

export const checkForNewTransactions = async ({
  conn,
  context,
  project,
}: {
  conn: Connection | undefined;
  context: Context;
  project: IProject;
}) => {
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

  const logValues: LogValues = {
    currentSupply: 0,
    newTokens: [],
    numOfTxsAdded: 0,
    project_name,
  };

  if (!conn) {
    throw new Error("No connection to database. (checkForNewTransactions)");
  }

  const { filteredTransactions: fetchedTransactions } = await fetchEvents({
    chain,
    conn,
    contractAddress: contract_address as Address,
    creationBlock: creation_block,
    events,
    projectId: project_id,
  });

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
