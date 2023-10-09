import type { AzureFunction, Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { getAllProjects } from "../src/db/queries/projectQueries";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const projects = await getAllProjects(conn);

    if (!projects) {
      context.res = {
        status: 400,
        body: "No projects on this server.",
      };
      return;
    }

    context.res = {
      status: 200,
      body: projects,
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
