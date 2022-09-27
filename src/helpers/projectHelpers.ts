import { Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { nullAddress } from '../constants';
import { IProject } from '../db/schemas/schemaTypes';
import {
  addProject,
  checkIfNewProjects,
  updateProjectCurrentSupply,
} from '../db/queries/projectQueries';
import { getCurrentTokenSupply, removeDuplicateTokens } from '../db/queries/tokenQueries';
import { addTransaction, getAllMintTransactions } from '../db/queries/transactionQueries';
import { abis } from '../projects/projectsInfo';
import { fetchEvents } from '../web3/blockchainFetches';
import { getContract } from '../web3/contract';
import { processNewTransactions } from './transactionHelpers';

const processNewProjects = async (projects: IProject[], conn: Connection) => {
  // try to add all projects to db, duplicates removed
  const resultArr = await Promise.all(
    projects.map((project) => addProject(project, conn)),
  );

  const projectsAdded = resultArr.filter(Boolean);
  const namesOfProjectsAdded = projectsAdded.map((project) => project.project_name);

  return { projectsAdded, namesOfProjectsAdded };
};

export const checkForNewProjects = async (
  context: Context,
  projects: IProject[],
  conn: Connection,
) => {
  const isNewProject = await checkIfNewProjects(projects, conn);

  if (isNewProject) {
    context.log.info('New project found, adding to db...');

    const { namesOfProjectsAdded } = await processNewProjects(projects, conn);

    context.log.info('These new projects were added:', ...namesOfProjectsAdded);
  } else {
    context.log.info('No new projects to add.');
  }
};

export const reconcileProject = async (
  context: Context,
  project: IProject,
  conn: Connection,
) => {
  const {
    _id: project_id,
    contract_address,
    events,
    creation_block,
    project_name,
  } = project;
  context.log.info(`Reconciling ${project_name} database to blockchain.`);

  const contract = getContract(abis[project_id], contract_address);

  // fetch all transactions from blockchain, add missing ones
  const allTransactions = await fetchEvents(
    contract,
    events,
    project_id,
    conn,
    creation_block,
  );
  const newTransactionsAdded = await Promise.all(
    allTransactions.map((tx) => addTransaction(tx, conn)),
  );
  const newTxNoNull = newTransactionsAdded.filter(Boolean);

  await processNewTransactions(newTxNoNull, project, contract, context, conn);

  const totalMintTransactions = allTransactions.filter(
    (tx) => tx.event === 'Transfer' && tx.returnValues.from === nullAddress,
  ).length;
  const totalTokensInDb = await getCurrentTokenSupply(project_id, conn);

  context.log.info('Total mint transactions:', totalMintTransactions);
  context.log.info('Total tokens in db:', totalTokensInDb);

  if (totalMintTransactions === totalTokensInDb) {
    context.log.info(`${project_name} has been fully reconciled.`);
    await updateProjectCurrentSupply(project_id, totalTokensInDb, conn);
  } else {
    if (totalMintTransactions < totalTokensInDb) {
      context.log.info(
        `${project_name} has a token count discrepancy, attempting to fix.`,
      );
      await removeDuplicateTokens(project_id, conn);
    } else {
      context.log.info(
        `${project_name} has a token count discrepancy, attempting to fix.`,
      );
      const allMintTransactions = await getAllMintTransactions(project_id, conn);
      await processNewTransactions(allMintTransactions, project, contract, context, conn);
    }
    const newTotalTokensInDb = await getCurrentTokenSupply(project_id, conn);
    if (totalMintTransactions === newTotalTokensInDb) {
      context.log.info(`${project_name} has been fully reconciled.`);
      await updateProjectCurrentSupply(project_id, newTotalTokensInDb, conn);
    } else {
      context.log.info(
        `${project_name} still has a token count discrepancy, please check the database.`,
      );
    }
  }
};
