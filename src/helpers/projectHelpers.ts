import { Context } from '@azure/functions';
import { nullAddress } from '../constants';
import { IProject } from '../db/models/modelTypes';
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

const processNewProjects = async (projects: IProject[]) => {
  // try to add all projects to db, duplicates removed
  const resultArr = await Promise.all(projects.map((project) => addProject(project)));

  const projectsAdded = resultArr.filter(Boolean);
  const namesOfProjectsAdded = projectsAdded.map((project) => project.project_name);

  return { projectsAdded, namesOfProjectsAdded };
};

export const checkForNewProjects = async (context: Context, projects: IProject[]) => {
  const isNewProject = await checkIfNewProjects(projects);
  if (isNewProject) {
    context.log.info('New project found, adding to db...');

    const { namesOfProjectsAdded } = await processNewProjects(projects);

    context.log.info('These new projects were added:', ...namesOfProjectsAdded);
  } else {
    context.log.info('No new projects to add.');
  }
};

export const reconcileProject = async (context: Context, project: IProject) => {
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
  const allTransactions = await fetchEvents(contract, events, project_id, creation_block);
  const newTransactionsAdded = await Promise.all(
    allTransactions.map((tx) => addTransaction(tx)),
  );
  const newTxNoNull = newTransactionsAdded.filter(Boolean);

  await processNewTransactions(newTxNoNull, project, contract, context);

  const totalMintTransactions = allTransactions.filter(
    (tx) => tx.event === 'Transfer' && tx.returnValues.from === nullAddress,
  ).length;
  const totalTokensInDb = await getCurrentTokenSupply(project_id);

  context.log.info('Total mint transactions:', totalMintTransactions);
  context.log.info('Total tokens in db:', totalTokensInDb);

  if (totalMintTransactions === totalTokensInDb) {
    context.log.info(`${project_name} has been fully reconciled.`);
    await updateProjectCurrentSupply(project_id, totalTokensInDb);
  } else {
    if (totalMintTransactions < totalTokensInDb) {
      context.log.info(
        `${project_name} has a token count discrepancy, attempting to fix.`,
      );
      await removeDuplicateTokens(project_id);
    } else {
      context.log.info(
        `${project_name} has a token count discrepancy, attempting to fix.`,
      );
      const allMintTransactions = await getAllMintTransactions(project_id);
      await processNewTransactions(allMintTransactions, project, contract, context);
    }
    const newTotalTokensInDb = await getCurrentTokenSupply(project_id);
    if (totalMintTransactions === newTotalTokensInDb) {
      context.log.info(`${project_name} has been fully reconciled.`);
      await updateProjectCurrentSupply(project_id, newTotalTokensInDb);
    } else {
      context.log.info(
        `${project_name} still has a token count discrepancy, please check the database.`,
      );
    }
  }
};
