import type { AzureFunction, Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { checkIfProjectExists } from "../src/db/queries/projectQueries";
import { getTokenLean } from "../src/db/queries/tokenQueries";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { project_slug, token_id } = context.bindingData;
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

    const token = await getTokenLean(project_slug, token_id, conn);

    if (!token) {
      context.res = {
        body: "Token not found",
        status: 404,
      };
      return;
    }

    context.res = {
      body: token,
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
