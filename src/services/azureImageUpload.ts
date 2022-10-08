import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';

export const uploadThumbnail = async (
  file: Buffer,
  project_slug: string,
  token_id: number,
) => {
  dotenv.config();
  const azureStorageConnectionString = process.env
    .AZURE_STORAGE_CONNECTION_STRING as string;

  if (!azureStorageConnectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING not found');
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    azureStorageConnectionString,
  );

  const isDev = process.env.NODE_ENV === 'development';
  const containerName = isDev ? 'images-dev' : 'images';
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const imageName = `${project_slug}_${token_id}.png`;
  const blockBlobClient = containerClient.getBlockBlobClient(imageName);

  await blockBlobClient.upload(file, file.length);

  await blockBlobClient.setHTTPHeaders({
    blobContentType: 'image/png',
  });

  return blockBlobClient.url;
};
