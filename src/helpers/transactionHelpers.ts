import { type Context } from '@azure/functions';
import { type Contract } from 'web3-eth-contract';
import { type Connection } from 'mongoose';
import type { IProject, ITransaction } from '../db/schemas/schemaTypes';
import { getProjectCurrentSupply } from '../db/queries/projectQueries';
import { checkIfTokenExists } from '../db/queries/tokenQueries';
import { addTransaction } from '../db/queries/transactionQueries';
import { abis } from '../projects';
import { fetchEvents, fetchScriptInputs } from '../web3/blockchainFetches';
import { getContract } from '../web3/contract';
import { getWeb3 } from '../web3/provider';
import { getProcessMintFunction, getProcessEventFunction } from './tokenHelpers';

export interface ILogValues {
  project_name: string;
  numOfTxsAdded: number;
  newTokens: number[];
  currentSupply: number;
}

export const processNewTransactions = async (
  newTxs: (ITransaction | null)[],
  project: IProject,
  contract: Contract,
  context: Context,
  conn: Connection,
) => {
  const {
    project_slug,
    devParams: { isBulkMint },
    events,
  } = project;
  const newTokenIds: number[] = [];

  for await (const tx of newTxs) {
    if (!tx) continue;

    const { event_type, token_id } = tx;
    const script_inputs = await fetchScriptInputs(contract, token_id);

    if (event_type === 'Mint') {
      if (isBulkMint) continue;

      const doesTokenExist = await checkIfTokenExists(token_id, project_slug, conn);

      if (!doesTokenExist) {
        const processMint = getProcessMintFunction(project._id);
        const newMint = await processMint(
          token_id,
          project,
          script_inputs,
          context,
          conn,
        );

        if (!newMint) {
          context.log.error(`Error processing new mint for ${project.project_name}`);
          continue;
        }

        newTokenIds.push(newMint.newTokenId);
      }
    } else {
      // this handles all other events events besides Mints
      const processEvent = getProcessEventFunction(project._id);

      if (events.length && processEvent) {
        await processEvent(token_id, project, script_inputs, context, conn);
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
    contract_address,
    chain,
    events,
    project_name,
    creation_block,
  } = project;
  context.log(`Checking for new transactions for ${project_name}...`);
  const web3 = getWeb3(chain);
  const contract = getContract(web3, abis[project_id], contract_address);

  const logValues: ILogValues = {
    project_name,
    numOfTxsAdded: 0,
    newTokens: [],
    currentSupply: 0,
  };

  if (!conn) throw new Error('No connection to database. (checkForNewTransactions)');

  const { filteredTransactions: fetchedTransactions } = await fetchEvents(
    contract,
    events,
    project_id,
    conn,
    creation_block,
  );

  const newTransactionsAdded = await Promise.all(
    fetchedTransactions.map(async (tx) => addTransaction(tx, project_id, conn, web3)),
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
