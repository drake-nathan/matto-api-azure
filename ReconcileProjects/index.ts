import { AzureFunction, Context } from "@azure/functions";
import * as dotenv from "dotenv";
import { Connection } from "mongoose";

import type { IProject } from "../src/db/schemas/schemaTypes";

import { connectionFactory } from "../src/db/connectionFactory";
import { removeDuplicateTransactions } from "../src/db/queries/transactionQueries";
import {
  checkForNewProjects,
  reconcileProject,
} from "../src/helpers/projectHelpers";
import { updateProjectIfNeeded } from "../src/helpers/projectHelpers/updateProjectIfNeeded";
import { projects as allProjects } from "../src/projects";

dotenv.config();

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
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

    await checkForNewProjects(context, projects, conn); // checks for new projects in the projects array that it receives and adds it to the database

    for await (const project of projects) {
      const _project = await updateProjectIfNeeded(project, context, conn);

      await reconcileProject(context, _project, conn);
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
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      body: error,
      status: 500,
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default timerTrigger;
