import { AzureFunction, Context } from "@azure/functions";
import { Connection } from "mongoose";
import sharp from "sharp";

import { connectionFactory } from "../src/db/connectionFactory";
import { getTokenLean } from "../src/db/queries/tokenQueries";
import { ProjectSlug } from "../src/projects";
import { deEscapeSvg } from "../src/utils/deEscapeSvg";

const convertTokenZero: AzureFunction = async (
  context: Context,
): Promise<void> => {
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const token = await getTokenLean(ProjectSlug["100x10x1-a-goerli"], 0, conn);

    if (!token || !token.svg) {
      context.res = {
        status: 404,
        body: "Could not fetch token",
      };
      return;
    }

    context.log.info(`Fetched composite svg, converting to png...`);

    const svg = deEscapeSvg(token.svg);

    const buffer = await sharp(Buffer.from(svg))
      .toFormat("png")
      .resize({ height: 1920, width: 1080 })
      .toBuffer();

    context.log.info(`Converted to png, returning...`);
    context.res = {
      headers: {
        "Content-Type": "image/png",
      },
      status: 200,
      body: buffer,
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
