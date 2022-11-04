/* eslint-disable no-restricted-syntax */
import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import {
  getThumbnailCounts,
  getThumbnailsByProject,
} from '../src/db/queries/thumbnailQueries';
import { processThumbnail } from '../src/helpers/thumbnailHelpers';
import { fetchFocusSupply } from '../src/services/fetchArtBlocks';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;

  try {
    conn = await connectionFactory(context);

    const ensoSupply = 1000;
    const focusSupply = await fetchFocusSupply();
    const thumbnailCount = await getThumbnailCounts(conn);

    if (thumbnailCount.enso < ensoSupply) {
      context.log.info('Enso thumbnails missing, creating...');
      const ensoThumbnails = await getThumbnailsByProject(conn, 'enso');
      const ensoArtBlocksId = 34000000;

      let count = 0;

      for await (const i100 of Array.from({ length: ensoSupply / 10 }, (_, i) => i)) {
        const newCounts = await Promise.all(
          Array.from({ length: 10 }, (_, i) => {
            const i1000 = i100 * 10 + i;
            const artblocks_id = `${ensoArtBlocksId + i1000}`;
            return processThumbnail(conn, ensoThumbnails, 'enso', artblocks_id, context);
          }),
        );

        count += newCounts.reduce((a, b) => a + b, 0);
      }

      context.log.info(`Created ${count} Enso thumbnails`);
    }

    if (thumbnailCount.focus < focusSupply) {
      context.log.info('Focus thumbnails missing, creating...');
    }
  } catch (error) {
    context.log.error('ArtBlocksThumbnails function error', error);
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    await conn.close();
  }
};

export default timerTrigger;
