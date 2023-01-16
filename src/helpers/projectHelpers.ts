import type { Context } from '@azure/functions';
import type { Connection } from 'mongoose';
import type { Contract, EventData } from 'web3-eth-contract';
import type Web3 from 'web3';
import { nullAddress } from './constants';
import type { IProject } from '../db/schemas/schemaTypes';
import {
  addProject,
  checkIfNewProjects,
  getProject,
  updateAppendedDescription,
  updateCollectionDescription,
  updateProjectSupplyAndCount,
  updateTokenDescription,
} from '../db/queries/projectQueries';
import {
  checkIfTokenExists,
  getAllTokensFromProject,
  getCurrentTokenSupply,
  removeDuplicateTokens,
} from '../db/queries/tokenQueries';
import {
  addTransaction,
  getAllMintTransactions,
  getTxCounts,
} from '../db/queries/transactionQueries';
import { abis } from '../projects';
import { fetchEvents, fetchScriptInputs } from '../web3/blockchainFetches';
import { getContract } from '../web3/contract';
import { processNewTransactions } from './transactionHelpers';
import {
  checkIfTokensMissingAttributes,
  repairBadTokens,
} from './tokenHelpers/projects/chainlifeHelpers';
import { getWeb3 } from '../web3/provider';
import { getProcessMintFunction } from './tokenHelpers';
import { updateMathareDescriptions } from './tokenHelpers/projects/mathareHelpers';

const processNewProjects = async (projects: IProject[], conn: Connection) => {
  // try to add all projects to db, duplicates removed
  const resultArr = await Promise.all(
    projects.map(async (project) => {
      const { total } = await getTxCounts(conn, project._id);
      const tokens = await getAllTokensFromProject(project.project_slug, conn);
      return addProject(
        { ...project, tx_count: total, current_supply: tokens.length },
        conn,
      );
    }),
  );

  const projectsAdded = resultArr.filter(Boolean);
  const namesOfProjectsAdded = projectsAdded.map((project) => project?.project_name);

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
    true,
  );

  const newTransactionsAdded = await Promise.all(
    allTransactions.map((tx) => addTransaction(tx, project_id, conn, web3)),
  );

  await processNewTransactions(newTransactionsAdded, project, contract, context, conn);

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
  const {
    _id: projectId,
    project_name: projectName,
    project_slug,
    maximum_supply: maxSupply,
    starting_index: startingIndex,
  } = project;

  if (totalTokensInDb === maxSupply) {
    context.log.info(`${projectName} has been reconciled.`);
    return;
  }

  const processMint = getProcessMintFunction(projectId);

  const iterateFrom = Math.max(startingIndex, totalTokensInDb);
  const iteratorSize = maxSupply + startingIndex - iterateFrom;

  const tokenIterator = [...Array(iteratorSize + iterateFrom).keys()].slice(iterateFrom);

  const newTokens: number[] = [];

  for await (const tokenId of tokenIterator) {
    const doesTokenExist = await checkIfTokenExists(tokenId, project_slug, conn);
    if (doesTokenExist) return;

    try {
      const scriptInputs = await fetchScriptInputs(contract, tokenId);
      const newMint = await processMint(tokenId, project, scriptInputs, context, conn);

      if (!newMint) {
        context.log.error(`Failed to mint token_id ${tokenId} for ${projectName}.`);
        return;
      }

      newTokens.push(newMint.newTokenId);
    } catch (err) {
      context.log.error(err);
    }
  }

  context.log.info(`Added ${newTokens.length} new tokens to ${projectName}.`);
};

const reconcileDescriptions = async (
  conn: Connection,
  context: Context,
  projectLocal: IProject,
) => {
  const {
    project_slug,
    collection_description: collDescLocal,
    description: tokenDescLocal,
    appended_description: appendedDescLocal,
  } = projectLocal;

  const projectDb = await getProject(project_slug, conn);

  if (!projectDb) {
    context.log.error(`Failed to find ${project_slug} in db.`);
    return;
  }

  const {
    collection_description: collDescDb,
    description: tokenDescDb,
    appended_description: appendedDescDb,
  } = projectDb;

  // if needed, update collection description on project in db
  if (collDescLocal !== collDescDb) {
    const updatedProject = await updateCollectionDescription(
      conn,
      project_slug,
      collDescLocal,
    );

    if (!updatedProject) {
      context.log.info(`Failed to update ${project_slug} collection description.`);
      return;
    }

    const { collection_description: updatedDescription } = updatedProject;

    if (updatedDescription === collDescLocal) {
      context.log.info(`Updated ${project_slug} collection description.`);
    } else {
      context.log.error(`Failed to update ${project_slug} collection description.`);
    }
  }

  // if needed, update token description on project AND tokens in db
  if (tokenDescLocal && tokenDescLocal !== tokenDescDb) {
    const updatedProject = await updateTokenDescription(
      conn,
      project_slug,
      tokenDescLocal,
    );

    if (!updatedProject) {
      context.log.info(`Failed to update ${project_slug} token description.`);
      return;
    }
  }

  if (appendedDescLocal && appendedDescLocal !== appendedDescDb) {
    const updatedProject = await updateAppendedDescription(
      conn,
      project_slug,
      appendedDescLocal,
    );

    if (!updatedProject) {
      context.log.info(`Failed to update ${project_slug} appended description.`);
      return;
    }

    await updateMathareDescriptions(conn, projectLocal);
  }
};

export const reconcileProject = async (
  context: Context,
  project: IProject,
  conn: Connection | undefined,
) => {
  const {
    _id: project_id,
    project_name,
    chain,
    contract_address,
    events,
    devParams: { isBulkMint, usesPuppeteer },
  } = project;
  context.log.info(`Reconciling ${project_name} database to blockchain.`);

  if (!conn) {
    context.log.error(`Failed to connect to database while reconciling ${project_name}.`);
    return;
  }

  const totalTokensInDb = await getCurrentTokenSupply(project_id, conn);

  const web3 = getWeb3(chain);
  const contract = getContract(web3, abis[project_id], contract_address);

  if (isBulkMint) {
    await reconcileBulkMint(conn, context, project, contract, totalTokensInDb);
  }

  if (usesPuppeteer) {
    await checkForMissingAttributes(conn, context, project);
  }

  await reconcileDescriptions(conn, context, project);

  // if no events to listen for, no need to store transactions at all, so we can skip the blockchain pings
  if (!events.length) return;

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
};
