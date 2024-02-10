import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Contract } from "web3-eth-contract";

import type { IProject } from "../../db/schemas/schemaTypes";

import {
  addProject,
  checkIfNewProjects,
  getProject,
  updateAppendedDescription,
  updateCollectionDescription,
  updateProjectSupplyAndCount,
  updateTokenDescription,
} from "../../db/queries/projectQueries";
import {
  checkIfTokenExists,
  getAllTokensFromProject,
  getCurrentTokenSupply,
} from "../../db/queries/tokenQueries";
import { getTxCounts } from "../../db/queries/transactionQueries";
import { ProjectId, ProjectSlug, abis } from "../../projects";
import { getContractWeb3 } from "../../web3/contractWeb3";
import { getWeb3 } from "../../web3/providers";
import { fetchScriptInputs } from "../../web3/web3Fetches";
import { getProcessMintFunction } from "../tokenHelpers";
import {
  checkIfTokensMissingAttributes,
  repairBadTokens,
} from "../tokenHelpers/projects/chainlifeHelpers";
import { updateMathareDescriptions } from "../tokenHelpers/projects/mathareHelpers";
import { reconcileTokens } from "./reconcileTokens";
import { reconcileTransactions } from "./reconcileTransactions";

const processNewProjects = async (projects: IProject[], conn: Connection) => {
  // try to add all projects to db, duplicates removed
  const resultArr = await Promise.all(
    projects.map(async (project) => {
      const { total } = await getTxCounts(conn, project._id);
      const tokens = await getAllTokensFromProject(project.project_slug, conn);

      let { creation_block } = project;

      if (project.project_slug === ProjectSlug.blonks) {
        const block = await getWeb3(project.chain).eth.getBlock("latest");
        const { number: blockNumber } = block;
        creation_block = blockNumber;
      }

      return addProject(
        {
          ...project,
          creation_block,
          current_supply: tokens.length,
          tx_count: total,
        },
        conn,
      );
    }),
  );

  const projectsAdded = resultArr.filter(Boolean);
  const namesOfProjectsAdded = projectsAdded.map(
    (project) => project?.project_name,
  );

  return { namesOfProjectsAdded, projectsAdded };
};

export const checkForNewProjects = async (
  context: Context,
  projects: IProject[],
  conn: Connection,
) => {
  const isNewProject = await checkIfNewProjects(projects, conn);

  if (isNewProject) {
    context.log.info("New project found, adding to db...");

    const { namesOfProjectsAdded } = await processNewProjects(projects, conn);

    context.log.info("These new projects were added:", ...namesOfProjectsAdded);
  } else {
    context.log.info("No new projects to add.");
  }
};

const checkForMissingAttributes = async (
  conn: Connection,
  context: Context,
  project: IProject,
) => {
  const { project_name, project_slug } = project;

  const { numOfBadTokens, tokensMissingAttributes } =
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
      context.log.info(
        `Successfully repaired all bad tokens for ${project_name}.`,
      );
    } else {
      context.log.error(
        `${numOfRemainingBadTokens} bad tokens still remain for ${project_name}, db might be slow, will try again at next reconcile.`,
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
    devParams: { usesScriptInputs },
    maximum_supply: maxSupply,
    project_name: projectName,
    project_slug,
    starting_index: startingIndex,
  } = project;

  if (totalTokensInDb === maxSupply) {
    context.log.info(`${projectName} has been reconciled.`);
    return;
  }

  const iterateFrom = startingIndex;
  const iteratorSize = maxSupply;

  const tokenIterator = [...Array(iteratorSize + iterateFrom).keys()].slice(
    iterateFrom,
  );

  const processMint = getProcessMintFunction(projectId);

  const newTokens: number[] = [];

  for await (const tokenId of tokenIterator) {
    const doesTokenExist = await checkIfTokenExists(
      tokenId,
      project_slug,
      conn,
    );
    if (doesTokenExist) continue;

    try {
      const scriptInputs =
        usesScriptInputs ?
          await fetchScriptInputs(contract, tokenId)
        : undefined;
      const newMint = await processMint(
        tokenId,
        project,
        context,
        conn,
        scriptInputs,
      );

      if (!newMint) {
        context.log.error(
          `Failed to mint token_id ${tokenId} for ${projectName}.`,
        );
        continue;
      }

      newTokens.push(newMint.newTokenId);
    } catch (err) {
      context.log.error(err);
    }
  }

  context.log.info(`Added ${newTokens.length} new tokens to ${projectName}.`);

  context.log.info(`${projectName} has been reconciled.`);
};

const reconcileDescriptions = async (
  conn: Connection,
  context: Context,
  projectLocal: IProject,
) => {
  const {
    appended_description: appendedDescLocal,
    collection_description: collDescLocal,
    description: tokenDescLocal,
    project_slug,
  } = projectLocal;

  const projectDb = await getProject(project_slug, conn);

  if (!projectDb) {
    context.log.error(`Failed to find ${project_slug} in db.`);
    return;
  }

  const {
    appended_description: appendedDescDb,
    collection_description: collDescDb,
    description: tokenDescDb,
  } = projectDb;

  // if needed, update collection description on project in db
  if (collDescLocal !== collDescDb) {
    const updatedProject = await updateCollectionDescription(
      conn,
      project_slug,
      collDescLocal,
    );

    if (!updatedProject) {
      context.log.info(
        `Failed to update ${project_slug} collection description.`,
      );
      return;
    }

    const { collection_description: updatedDescription } = updatedProject;

    if (updatedDescription === collDescLocal) {
      context.log.info(`Updated ${project_slug} collection description.`);
    } else {
      context.log.error(
        `Failed to update ${project_slug} collection description.`,
      );
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
      context.log.info(
        `Failed to update ${project_slug} appended description.`,
      );
      return;
    }

    await updateMathareDescriptions(conn, projectLocal);
  }
};

const checkIfTokenZeroExists = async (
  conn: Connection,
  context: Context,
  project: IProject,
) => {
  const { _id: id, project_slug: slug } = project;

  const doesTokenExist = await checkIfTokenExists(0, slug, conn);

  if (doesTokenExist) return;

  const processMint = getProcessMintFunction(id);

  await processMint(0, project, context, conn);
};

export const reconcileProject = async (
  context: Context,
  project: IProject,
  conn: Connection | undefined,
) => {
  const {
    _id: project_id,
    chain,
    contract_address,
    devParams: { isBulkMint, usesPuppeteer },
    events,
    project_name,
  } = project;

  context.log.info(`Reconciling ${project_name} database to blockchain.`);

  if (!conn) {
    context.log.error(
      `Failed to connect to database while reconciling ${project_name}.`,
    );
    return;
  }

  const is100x10x1 = project_id === ProjectId["100x10x1-a-goerli"];
  if (is100x10x1) {
    await checkIfTokenZeroExists(conn, context, project);
  }

  const totalTokensInDb = await getCurrentTokenSupply(project_id, conn);

  const web3 = getWeb3(chain);
  const contract = getContractWeb3(web3, abis[project_id], contract_address);

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
  const { allTransactions, totalTxCount } = await reconcileTransactions({
    conn,
    context,
    contract,
    project,
  });

  if (!isBulkMint) {
    await reconcileTokens({
      allTransactions,
      conn,
      context,
      contract,
      project,
      totalTokensInDb,
      totalTxCount,
    });
  } else {
    await updateProjectSupplyAndCount(
      project_id,
      totalTokensInDb,
      totalTxCount,
      conn,
    );
  }
};
