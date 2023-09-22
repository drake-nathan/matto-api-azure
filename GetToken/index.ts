import { AzureFunction, Context } from "@azure/functions";
import { Connection } from "mongoose";

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
        status: 404,
        body: "Project not found",
      };
      return;
    }

    const token = await getTokenLean(project_slug, token_id, conn);

    if (!token) {
      context.res = {
        status: 404,
        body: "Token not found",
      };
      return;
    }

    context.res = {
      status: 200,
      body: token,
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      status: 500,
      body: "Internal Server Error",
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default httpTrigger;
