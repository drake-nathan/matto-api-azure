import axios from "axios";
import sharp from "sharp";

import type { ProjectId, ProjectSlug } from "../projects";

import { projectSizes } from "../projects";
import { deEscapeSvg } from "../utils/deEscapeSvg";
import { BlobFolder, uploadImage } from "./azureStorage";

export const fetchResizeUploadImages = async (
  projectId: ProjectId,
  projectSlug: ProjectSlug,
  tokenId: number,
  imageUrl: string,
): Promise<string[]> => {
  const sizes = projectSizes[projectId];

  let imageBuffer: Buffer;

  try {
    const { data } = await axios.get<Buffer>(imageUrl, {
      responseType: "arraybuffer",
    });

    imageBuffer = data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Error fetching image for ${projectSlug} ${tokenId}: ${error.message}`,
      );
    } else {
      throw new Error(`Error fetching image for ${projectSlug} ${tokenId}.`);
    }
  }

  const midBuffer = await sharp(imageBuffer).resize(sizes.mid).toBuffer();
  const smallBuffer = await sharp(imageBuffer).resize(sizes.small).toBuffer();

  const image_mid = await uploadImage(
    midBuffer,
    projectSlug,
    tokenId,
    BlobFolder.mid,
  );
  const image_small = await uploadImage(
    smallBuffer,
    projectSlug,
    tokenId,
    BlobFolder.small,
  );

  return [image_mid, image_small];
};

export const svgToPngAndUpload = async (
  svg: string,
  projectId: ProjectId,
  projectSlug: ProjectSlug,
  tokenId: number,
): Promise<{
  image: string;
  image_mid: string;
  image_small: string;
}> => {
  const sizes = projectSizes[projectId];

  const svgParsed = deEscapeSvg(svg);

  const buffer = await sharp(Buffer.from(svgParsed)).png().toBuffer();
  const midBuffer = await sharp(buffer).resize(sizes.mid).toBuffer();
  const smallBuffer = await sharp(buffer).resize(sizes.small).toBuffer();

  const image = await uploadImage(buffer, projectSlug, tokenId);
  const image_mid = await uploadImage(
    midBuffer,
    projectSlug,
    tokenId,
    BlobFolder.mid,
  );
  const image_small = await uploadImage(
    smallBuffer,
    projectSlug,
    tokenId,
    BlobFolder.small,
  );

  return { image, image_mid, image_small };
};
