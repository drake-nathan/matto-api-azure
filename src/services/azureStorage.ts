import { Context } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';

dotenv.config();

const azureStorageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!azureStorageConnectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING not found');
}

export const uploadThumbnail = async (
  context: Context,
  file: Buffer,
  project_slug: string,
  token_id: number,
  folderName?: string,
) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    azureStorageConnectionString,
  );

  const containerName = 'images';

  const containerClient = blobServiceClient.getContainerClient(
    folderName || containerName,
  );
  containerClient.createIfNotExists();
  containerClient.setAccessPolicy('blob');

  const imageName = `${project_slug}_${token_id}.png`;
  const blockBlobClient = containerClient.getBlockBlobClient(imageName);

  await blockBlobClient.upload(file, file.length);

  await blockBlobClient.setHTTPHeaders({
    blobContentType: 'image/png',
  });

  return blockBlobClient.url;
};
