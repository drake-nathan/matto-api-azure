import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import type { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { getTokenLean } from "../src/db/queries/tokenQueries";
import { updateCompositeImage } from "../src/projects/100x10x1x/helpers/updateCompositeImage";
import { deEscapeSvg } from "../src/utils/deEscapeSvg";

const convertTokenZero: AzureFunction = async (
  context: Context,
  req: HttpRequest,
): Promise<void> => {
  const { project_slug } = context.bindingData;
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const token = await getTokenLean(project_slug, 0, conn);

    if (!token || !token.svg) {
      context.res = {
        status: 404,
        body: "Could not fetch token, or token has no svg",
      };
      return;
    }

    const force = req.query.force === "true";

    const imageLastUpdated = token.image_updated_at;

    if (
      !force &&
      imageLastUpdated &&
      imageLastUpdated > new Date(Date.now() - 1000 * 60 * 10)
    ) {
      // return current image
      context.log.info(
        `Image updated less than 10 minutes ago, returning current image`,
      );
      context.res = {
        status: 200,
        body: token,
      };
      return;
    }

    context.log.info(`Fetched composite svg, converting to png...`);

    const svg = deEscapeSvg(token.svg);

    const updatedToken = await updateCompositeImage({
      conn,
      svg,
      projectId: token.project_id,
      projectSlug: token.project_slug,
      tokenId: token.token_id,
    });

    context.log.info(`Converted to png, returning...`);
    context.res = {
      status: 200,
      body: updatedToken,
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

export default convertTokenZero;
