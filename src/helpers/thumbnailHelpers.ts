import { Context } from '@azure/functions';
import axios from 'axios';
import { Connection } from 'mongoose';
import sharp from 'sharp';
import { IThumbnail } from '../db/schemas/schemaTypes';
import { uploadThumbnail } from '../services/azureStorage';

export const fetchImageUploadThumbnail = async (
  image_full: string,
  project_slug: string,
  token_id: number,
) => {
  const response = await axios(image_full, { responseType: 'arraybuffer' });

  const thumbnail = await sharp(response.data).resize(200).toBuffer();

  const image_thumbnail = await uploadThumbnail(
    thumbnail,
    project_slug,
    token_id,
    'thumbnails',
  );

  return image_thumbnail;
};

export const processThumbnail = async (
  conn: Connection,
  existingThumbnails: IThumbnail[],
  project_slug: string,
  artblocks_id: string,
  context: Context,
) => {
  const Thumbnail = conn.model<IThumbnail>('Thumbnail');

  const doesThumbnailExist = existingThumbnails.find(
    (thumbnail) => thumbnail.artblocks_id === artblocks_id,
  );

  if (!doesThumbnailExist) {
    const project_id = artblocks_id.length === 8 ? 34 : 181;
    const token_id = parseInt(artblocks_id.slice(-3));

    const image_full = `https://artblocks-mainnet.s3.amazonaws.com/${artblocks_id}.png`;

    const image_thumbnail = await fetchImageUploadThumbnail(
      image_full,
      project_slug,
      token_id,
    );

    const thumbnail = new Thumbnail({
      project_slug,
      project_id,
      token_id,
      artblocks_id,
      image_full,
      image_thumbnail,
    });

    await thumbnail.save();

    return 1;
  }

  return 0;
};
