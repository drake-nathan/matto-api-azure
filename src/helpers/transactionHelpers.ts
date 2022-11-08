/* eslint-disable no-restricted-syntax */
import { Context } from '@azure/functions';
import { Contract } from 'web3-eth-contract';
import { Connection } from 'mongoose';
import { IProject, ITransaction } from '../db/schemas/schemaTypes';
import { getProjectCurrentSupply } from '../db/queries/projectQueries';
import { checkIfTokenExists } from '../db/queries/tokenQueries';
import { addTransaction } from '../db/queries/transactionQueries';
import { abis } from '../projects/projectsInfo';
import { fetchEvents, fetchScriptInputs } from '../web3/blockchainFetches';
import { getContract } from '../web3/contract';
import { processNewTokenMint, processTransferEvent } from './tokenHelpers';
import { getWeb3 } from '../web3/provider';

export interface ILogValues {
  project_name: string;
  numOfTxsAdded: number;
  newTokens: number[];
  currentSupply: number;
}

export const processNewTransactions = async (
  newTxs: ITransaction[],
  project: IProject,
  contract: Contract,
  context: Context,
  conn: Connection,
) => {
  const newTokenIds: number[] = [];

  for await (const tx of newTxs) {
    const { event_type, token_id } = tx;
    const script_inputs = await fetchScriptInputs(contract, token_id);

    if (event_type === 'Mint') {
      const doesTokenExist = await checkIfTokenExists(
        token_id,
        project.project_slug,
        conn,
      );

      if (!doesTokenExist) {
        const { newTokenId } = await processNewTokenMint(
          token_id,
          project,
          script_inputs,
          context,
          conn,
        );
        newTokenIds.push(newTokenId);
      }
    } else {
      // this handles all other events events besides Mints
      await processTransferEvent(token_id, project, script_inputs, context, conn);
    }
  }

  return newTokenIds;
};

export const checkForNewTransactions = async (
  project: IProject,
  context: Context,
  conn: Connection,
) => {
  const { _id: project_id, contract_address, chain, events, project_name } = project;
  context.log(`Checking for new transactions for ${project_name}...`);
  const web3 = getWeb3(chain);
  const contract = getContract(web3, abis[project_id], contract_address);

  const logValues: ILogValues = {
    project_name,
    numOfTxsAdded: 0,
    newTokens: [],
    currentSupply: 0,
  };

  const fetchedTransactions = await fetchEvents(contract, events, project_id, conn);

  const newTransactionsAdded = await Promise.all(
    fetchedTransactions.map(async (tx) => addTransaction(tx, conn, web3)),
  );
  const newTxNoNull = newTransactionsAdded.filter(Boolean);

  if (newTxNoNull.length)
    context.log.info(`${newTxNoNull.length} missing transactions found and added.`);

  if (!newTxNoNull.length) {
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
