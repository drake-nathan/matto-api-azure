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
import { checkIfTokensMissingAttributes, repairBadTokens } from './tokenHelpers';
import { getWeb3 } from '../web3/provider';

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
    chain,
    events,
    creation_block,
    project_name,
    project_slug,
  } = project;
  context.log.info(`Reconciling ${project_name} database to blockchain.`);

  const { tokensMissingAttributes, numOfBadTokens } =
    await checkIfTokensMissingAttributes(project_slug, conn);

  if (!numOfBadTokens) {
    context.log.info(`No bad tokens found for ${project_name}.`);
  } else {
    context.log.error(
      `Found ${numOfBadTokens} bad tokens for ${project_name}, attempting to repair...`,
    );

    const numOfRemainingBadTokens = await repairBadTokens(
      project,
      tokensMissingAttributes,
      context,
      conn,
    );

    if (!numOfRemainingBadTokens) {
      context.log.info(`Successfully repaired all bad tokens for ${project_name}.`);
    } else {
      context.log.error(
        `${numOfRemainingBadTokens} bad tokens still remain for ${project_name}, db might be slow, will try again at next reconcile.`,
      );
    }
  }

  const web3 = getWeb3(chain);
  const contract = getContract(web3, abis[project_id], contract_address);

  // fetch all transactions from blockchain, add missing ones
  const allTransactions = await fetchEvents(
    contract,
    events,
    project_id,
    conn,
    creation_block,
  );
  const newTransactionsAdded = await Promise.all(
    allTransactions.map((tx) => addTransaction(tx, conn, web3)),
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
      context.log.error(
        `${project_name} has a token count discrepancy, attempting to fix.`,
      );
      await removeDuplicateTokens(project_id, conn);
    } else {
      context.log.error(
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
      context.log.error(
        `${project_name} still has a token count discrepancy, please check the database.`,
      );
    }
  }
};
