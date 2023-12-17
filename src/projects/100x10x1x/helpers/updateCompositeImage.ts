import type { Connection } from "mongoose";

import type { IToken } from "../../../db/schemas/schemaTypes";
import { svgToPngAndUpload } from "../../../services/images";
import { ProjectId, ProjectSlug } from "../..";

export const updateCompositeImage = async ({
  conn,
  svg,
  projectId,
  projectSlug,
  tokenId,
}: {
  conn: Connection;
  svg: string;
  projectId: ProjectId;
  projectSlug: ProjectSlug;
  tokenId: number;
}) => {
  const pngs = await svgToPngAndUpload(svg, projectId, projectSlug, tokenId);

  const Token = conn.model<IToken>("Token");

  const query = Token.findOneAndUpdate(
    { project_id: projectId, token_id: tokenId },
    {
      image: pngs.image,
      image_mid: pngs.image_mid,
      image_small: pngs.image_small,
      image_updated_at: new Date(),
    },
    { new: true },
  );

  return query.lean().exec();
};
