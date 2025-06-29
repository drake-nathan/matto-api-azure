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

interface CheckForNewTransactionsParams {
  conn: Connection | undefined;
  context: Context;
  functionName?: string;
  project: IProject;
}

export const checkForNewTransactions = async ({
  conn,
  context,
  functionName,
  project,
}: CheckForNewTransactionsParams) => {
  const {
    _id: projectId,
    chain,
    contract_address: contractAddress,
    creation_block: creationBlock,
    events,
    project_name: projectName,
  } = project;

  context.log(`Checking for new transactions for ${projectName}...`);

  const web3 = getWeb3(chain, functionName);
  const contract = getContractWeb3(web3, abis[projectId], contractAddress);

  const logValues: LogValues = {
    currentSupply: 0,
    newTokens: [],
    numOfTxsAdded: 0,
    project_name: projectName,
  };

  if (!conn) {
    context.log.error(
      `No DB connection for ${projectName} in checkForNewTransactions`,
    );
    return logValues;
  }

  const { err, filteredTransactions: fetchedTransactions } = await fetchEvents({
    chain,
    conn,
    context,
    contractAddress: contractAddress as Address,
    creationBlock,
    events,
    functionName,
    projectId,
  });

  if (err) {
    context.log.error(`Error fetching transactions for ${projectName}: ${err}`);
    return logValues;
  }

  const newTransactionsAdded = await Promise.all(
    fetchedTransactions.map(async (tx) => addTransaction(tx, projectId, conn)),
  );
  const newTxNoNull = newTransactionsAdded.filter(Boolean);

  if (newTxNoNull.length === 0) {
    const currentSupply = await getProjectCurrentSupply(projectId, conn);
    logValues.currentSupply = currentSupply;
    return logValues;
  }

  logValues.numOfTxsAdded = newTxNoNull.length;

  context.log.info(
    `${newTxNoNull.length} missing transactions found and added.`,
  );

  const newTokenIds = await processNewTransactions(
    newTxNoNull,
    project,
    contract,
    context,
    conn,
  );

  logValues.newTokens = newTokenIds;

  const newSupply = await getProjectCurrentSupply(projectId, conn);
  logValues.currentSupply = newSupply;

  return logValues;
};
