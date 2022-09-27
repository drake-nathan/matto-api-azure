/* eslint-disable no-restricted-syntax */
import { Context } from '@azure/functions';
import { Contract } from 'web3-eth-contract';
import { IProject, ITransaction } from '../db/models/modelTypes';
import { getProjectCurrentSupply } from '../db/queries/projectQueries';
import { checkIfTokenExists } from '../db/queries/tokenQueries';
import { addTransaction } from '../db/queries/transactionQueries';
import { abis } from '../projects/projectsInfo';
import { fetchEvents, fetchScriptInputs } from '../web3/blockchainFetches';
import { getContract } from '../web3/contract';
import { processNewTokenMint, processTransferEvent } from './tokenHelpers';

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
) => {
  const newTokenIds: number[] = [];

  for await (const tx of newTxs) {
    const { event_type, token_id } = tx;
    const script_inputs = await fetchScriptInputs(contract, token_id);

    if (event_type === 'Mint') {
      const doesTokenExist = await checkIfTokenExists(token_id);
      if (!doesTokenExist) {
        const { newTokenId } = await processNewTokenMint(
          token_id,
          project,
          script_inputs,
          context,
        );
        newTokenIds.push(newTokenId);
      }
    } else {
      // this handles transfer and custom rule events
      await processTransferEvent(token_id, project, script_inputs, context);
    }
  }

  return newTokenIds;
};

export const checkForNewTransactions = async (project: IProject, context: Context) => {
  const {
    _id: project_id,
    contract_address,
    events,
    project_name,
    creation_block,
  } = project;
  const contract = getContract(abis[project_id], contract_address);

  const logValues: ILogValues = {
    project_name,
    numOfTxsAdded: 0,
    newTokens: [],
    currentSupply: 0,
  };

  // TODO: Remove creation_block from this query
  const fetchedTransactions = await fetchEvents(
    contract,
    events,
    project_id,
    creation_block,
  );

  const newTransactionsAdded = await Promise.all(
    fetchedTransactions.map(async (tx) => addTransaction(tx)),
  );
  const newTxNoNull = newTransactionsAdded.filter(Boolean);

  if (!newTxNoNull.length) {
    const currentSupply = await getProjectCurrentSupply(project._id);
    logValues.currentSupply = currentSupply;
    return logValues;
  }

  logValues.numOfTxsAdded = newTxNoNull.length;

  const newTokenIds = await processNewTransactions(
    newTxNoNull,
    project,
    contract,
    context,
  );
  logValues.newTokens = newTokenIds;

  const newSupply = await getProjectCurrentSupply(project._id);
  logValues.currentSupply = newSupply;

  return logValues;
};
