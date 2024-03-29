import type { AzureFunction, Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { checkIfProjectExists } from "../src/db/queries/projectQueries";
import { getLevelSnapshots } from "../src/db/queries/snapshotQueries";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { project_slug } = context.bindingData;

  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const doesProjectExist = await checkIfProjectExists(project_slug, conn);

    if (!doesProjectExist) {
      context.res = {
        body: "Project not found",
        status: 404,
      };
      return;
    }

    const levelSnapshots = await getLevelSnapshots(conn, project_slug);

    context.res = {
      body: levelSnapshots,
      status: 200,
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      body: "Internal Server Error",
      status: 500,
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default httpTrigger;
