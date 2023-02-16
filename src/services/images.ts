import axios from 'axios';
import sharp from 'sharp';
import { ProjectId, projectSizes, ProjectSlug } from '../projects';
import { BlobFolder, uploadImage } from './azureStorage';

export const fetchResizeUploadImages = async (
  projectId: ProjectId,
  projectSlug: ProjectSlug,
  tokenId: number,
  imageUrl: string,
): Promise<{
  image_mid: string;
  image_small: string;
}> => {
  const sizes = projectSizes[projectId];

  let imageBuffer: Buffer;

  try {
    const { data } = await axios.get<Buffer>(imageUrl, {
      responseType: 'arraybuffer',
    });

    imageBuffer = data;
  } catch (error) {
    throw new Error(`Error fetching image for ${projectSlug} ${tokenId}: ${error}`);
  }

  const midBuffer = await sharp(imageBuffer).resize(sizes.mid).toBuffer();
  const smallBuffer = await sharp(imageBuffer).resize(sizes.small).toBuffer();

  const image_mid = await uploadImage(midBuffer, projectSlug, tokenId, BlobFolder.mid);
  const image_small = await uploadImage(
    smallBuffer,
    projectSlug,
    tokenId,
    BlobFolder.small,
  );

  return { image_mid, image_small };
};
