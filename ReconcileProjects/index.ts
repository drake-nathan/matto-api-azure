import type { AzureFunction, Context } from "@azure/functions";
import type { Connection } from "mongoose";

import * as dotenv from "dotenv";

import type { IProject } from "../src/db/schemas/schemaTypes";

import { connectionFactory } from "../src/db/connectionFactory";
import { removeDuplicateTransactions } from "../src/db/queries/transactionQueries";
import {
  checkForNewProjects,
  reconcileProject,
} from "../src/helpers/projectHelpers";
import { updateProjectIfNeeded } from "../src/helpers/projectHelpers/updateProjectIfNeeded";
import { projects as allProjects } from "../src/projects";
import { logRpcCount } from "../src/utils/rpcCounter";

dotenv.config();

const reconcileProjects: AzureFunction = async (
  context: Context,
): Promise<void> => {
  let conn: Connection | undefined;
  const projects: IProject[] = [];

  const isDev = process.env.NODE_ENV === "development";

  allProjects.forEach((project) => {
    if (isDev && project.devParams.useInDev) {
      projects.push(project);
    } else if (!isDev && project.devParams.useInProd) {
      projects.push(project);
    }
  });

  try {
    conn = await connectionFactory(context);

    await checkForNewProjects(
      context,
      projects,
      conn,
      context.executionContext.functionName,
    );

    for await (const project of projects) {
      const _project = await updateProjectIfNeeded(project, context, conn);

      await reconcileProject(
        context,
        _project,
        conn,
        context.executionContext.functionName,
      );
    }

    const numOfDuplicateTransactions = await removeDuplicateTransactions(conn);

    if (numOfDuplicateTransactions) {
      context.log.error(
        "Removed",
        numOfDuplicateTransactions,
        "duplicate transactions.",
      );
    }
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") {
      console.error(error);
    }
    context.res = {
      body: error,
      status: 500,
    };
  } finally {
    if (conn) {
      await conn.close();
    }
    logRpcCount(context);
  }
};

export default reconcileProjects;
