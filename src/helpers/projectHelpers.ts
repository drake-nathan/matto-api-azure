import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { Contract, EventData } from 'web3-eth-contract';
import type Web3 from 'web3';
import { nullAddress } from './constants';
import { IProject } from '../db/schemas/schemaTypes';
import {
  addProject,
  checkIfNewProjects,
  getProject,
  updateCollectionDescription,
  updateProjectSupplyAndCount,
  updateTokenDescription,
} from '../db/queries/projectQueries';
import {
  checkIfTokenExists,
  getCurrentTokenSupply,
  removeDuplicateTokens,
  updateTokenDesc,
} from '../db/queries/tokenQueries';
import { addTransaction, getAllMintTransactions } from '../db/queries/transactionQueries';
import { abis } from '../projects';
import { fetchEvents, fetchScriptInputs } from '../web3/blockchainFetches';
import { getContract } from '../web3/contract';
import { processNewTransactions } from './transactionHelpers';
import {
  checkIfTokensMissingAttributes,
  repairBadTokens,
} from './tokenHelpers/chainlifeHelpers';
import { getWeb3 } from '../web3/provider';
import { getProcessMintFunction } from './tokenHelpers/tokenHelpers';

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

const checkForMissingAttributes = async (
  conn: Connection,
  context: Context,
  project: IProject,
) => {
  const { project_name, project_slug } = project;

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
};

const reconcileTransactions = async (
  conn: Connection,
  context: Context,
  project: IProject,
  contract: Contract,
  web3: Web3,
) => {
  const { _id: project_id, events, creation_block } = project;

  const { filteredTransactions: allTransactions, totalTxCount } = await fetchEvents(
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

  return { allTransactions, totalTxCount };
};

const reconcileTokens = async (
  conn: Connection,
  context: Context,
  project: IProject,
  contract: Contract,
  allTransactions: EventData[],
  totalTxCount: number,
  totalTokensInDb: number,
) => {
  const { _id: project_id, project_name } = project;

  const totalMintTransactions = allTransactions.filter(
    (tx) => tx.event === 'Transfer' && tx.returnValues.from === nullAddress,
  ).length;

  context.log.info('Total mint transactions:', totalMintTransactions);
  context.log.info('Total tokens in db:', totalTokensInDb);

  if (totalMintTransactions === totalTokensInDb) {
    context.log.info(`${project_name} has been fully reconciled.`);
    await updateProjectSupplyAndCount(project_id, totalTokensInDb, totalTxCount, conn);
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
      await updateProjectSupplyAndCount(
        project_id,
        newTotalTokensInDb,
        totalTxCount,
        conn,
      );
    } else {
      context.log.error(
        `${project_name} still has a token count discrepancy, please check the database.`,
      );
    }
  }
};

const reconcileBulkMint = async (
  conn: Connection,
  context: Context,
  project: IProject,
  contract: Contract,
  totalTokensInDb: number,
) => {
  const { project_name, project_slug, maximum_supply, starting_index } = project;

  if (totalTokensInDb === maximum_supply) {
    context.log.info(`${project_name} has been fully reconciled.`);
    return;
  }

  const tokenIterator = [...Array(maximum_supply + starting_index).keys()].slice(
    starting_index,
  );

  const newTokens = await Promise.all(
    tokenIterator.map(async (token_id) => {
      const doesTokenExist = await checkIfTokenExists(token_id, project_slug, conn);
      if (doesTokenExist) return;

      try {
        const script_inputs = await fetchScriptInputs(contract, token_id);
        const processMint = getProcessMintFunction(project);
        const { newTokenId } = await processMint(
          token_id,
          project,
          script_inputs,
          context,
          conn,
        );

        return newTokenId;
      } catch (err) {
        context.log.error(err);
      }
    }),
  );

  context.log.info(`Added ${newTokens.length} new tokens to ${project_name}.`);
};

const reconcileDescriptions = async (
  conn: Connection,
  context: Context,
  projectLocal: IProject,
) => {
  const {
    _id: project_id,
    project_slug,
    collection_description: collDescLocal,
    description: tokenDescLocal,
  } = projectLocal;

  const projectDb = await getProject(project_slug, conn);
  const { collection_description: collDescDb, description: tokenDesc } = projectDb;

  // if needed, update collection description on project in db
  if (collDescLocal !== collDescDb) {
    const updatedProject = await updateCollectionDescription(
      conn,
      project_slug,
      collDescLocal,
    );

    const { collection_description: updatedDescription } = updatedProject;

    if (updatedDescription === collDescLocal) {
      context.log.info(`Updated ${project_slug} collection description.`);
    } else {
      context.log.error(`Failed to update ${project_slug} collection description.`);
    }
  }

  // if needed, update token description on project AND tokens in db
  if (tokenDescLocal !== tokenDesc) {
    const updatedProject = await updateTokenDescription(
      conn,
      project_slug,
      tokenDescLocal,
    );

    const numOfTokensUpdate = await updateTokenDesc(conn, project_id, tokenDescLocal);

    const { description: updatedDescription } = updatedProject;

    if (updatedDescription === tokenDescLocal && numOfTokensUpdate) {
      context.log.info(
        `Updated ${project_slug} token description, ${numOfTokensUpdate} tokens updated.`,
      );
    } else {
      context.log.error(`Failed to update ${project_slug} token description.`);
    }
  }
};

export const reconcileProject = async (
  context: Context,
  project: IProject,
  conn: Connection,
) => {
  const {
    _id: project_id,
    project_name,
    chain,
    contract_address,
    devParams: { isBulkMint, usesPuppeteer },
  } = project;
  context.log.info(`Reconciling ${project_name} database to blockchain.`);

  const totalTokensInDb = await getCurrentTokenSupply(project_id, conn);

  const web3 = getWeb3(chain);
  const contract = getContract(web3, abis[project_id], contract_address);

  if (isBulkMint) {
    await reconcileBulkMint(conn, context, project, contract, totalTokensInDb);
  }

  if (usesPuppeteer) {
    await checkForMissingAttributes(conn, context, project);
  }

  // fetch all transactions from blockchain, add missing ones
  const { allTransactions, totalTxCount } = await reconcileTransactions(
    conn,
    context,
    project,
    contract,
    web3,
  );

  if (!isBulkMint) {
    await reconcileTokens(
      conn,
      context,
      project,
      contract,
      allTransactions,
      totalTxCount,
      totalTokensInDb,
    );
  } else {
    await updateProjectSupplyAndCount(project_id, totalTokensInDb, totalTxCount, conn);
  }

  await reconcileDescriptions(conn, context, project);
};
