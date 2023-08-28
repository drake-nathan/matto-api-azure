import { AzureFunction, Context } from "@azure/functions";
import { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { getProject } from "../src/db/queries/projectQueries";
import { getTxCounts } from "../src/db/queries/transactionQueries";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { project_slug } = context.bindingData;
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const project = await getProject(project_slug, conn);

    if (!project) {
      context.res = {
        status: 404,
        body: "Invalid project slug",
      };
      return;
    }

    const txCounts = await getTxCounts(conn, project._id);

    context.res = {
      status: 200,
      body: txCounts,
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      status: 500,
      body: "Can't get tx counts right now",
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default httpTrigger;
