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
        body: "No projects on this server.",
        status: 400,
      };
      return;
    }

    context.res = {
      body: projects,
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
