import { AzureFunction, Context } from "@azure/functions";
import { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { getThumbnail } from "../src/db/queries/thumbnailQueries";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { artblocks_id } = context.bindingData;
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const thumbnail = await getThumbnail(conn, artblocks_id);

    if (!thumbnail) {
      context.res = {
        body: "Thumbnail not found",
        status: 404,
      };
      return;
    }

    context.res = {
      body: thumbnail,
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
