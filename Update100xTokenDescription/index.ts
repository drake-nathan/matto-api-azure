import type { AzureFunction, Context } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { getProject } from "../src/db/queries/projectQueries";
import { getTokenLean } from "../src/db/queries/tokenQueries";
import { ProjectSlug } from "../src/projects";
import { updateTokenDescription } from "../src/projects/100x10x1x/helpers/updateTokenDescription";

const update100xTokenDescription: AzureFunction = async (
  context: Context,
): Promise<void> => {
  const { token_id } = context.bindingData;
  const project_slug = ProjectSlug["100x10x1-a-goerli"];

  let conn: Connection | undefined;
  try {
    conn = await connectionFactory(context);

    const project = await getProject(project_slug, conn);

    await updateTokenDescription({
      chain: project?.chain,
      conn,
      contractAddress: project?.contract_address,
      projectId: project?._id,
      tokenId: token_id,
    });

    const token = await getTokenLean(project_slug, token_id, conn);

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

export default update100xTokenDescription;
