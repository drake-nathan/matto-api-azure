import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import fs from 'fs';

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

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      azureStorageConnectionString,
    );

    const containerName = 'images';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const imageName = `${project_slug}_${token_id}.png`;
    const blockBlobClient = containerClient.getBlockBlobClient(imageName);

    await blockBlobClient.upload(file, file.length);

    await blockBlobClient.setHTTPHeaders({
      blobContentType: 'image/png',
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// const testImage = fs.readFileSync(
//   '/Users/nathandrake/code/matto-azure-functions/degenz.png',
// );

// uploadThumbnail(testImage, 'chainlife', 1)
//   .then((url) => console.log(url))
//   .catch((error) => console.error(error));
