import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import {
  getThumbnailCounts,
  getThumbnailsByProject,
} from '../src/db/queries/thumbnailQueries';
import { processThumbnails } from '../src/helpers/thumbnailHelpers';
import { fetchFocusSupply } from '../src/services/fetchArtBlocks';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const ensoSupply = 1000;
    const focusSupply = await fetchFocusSupply();
    const thumbnailCount = await getThumbnailCounts(conn);

    if (thumbnailCount.enso < ensoSupply) {
      context.log.info('Enso thumbnails missing, creating...');
      const ensoThumbnails = await getThumbnailsByProject(conn, 'enso');
      const ensoArtBlocksId = 34000000;

      const thumbnailsAdded = await processThumbnails(
        conn,
        ensoSupply,
        'enso',
        ensoArtBlocksId,
        ensoThumbnails,
        context,
      );

      context.log.info(`Added ${thumbnailsAdded} Enso thumbnails`);
    } else context.log.info('Enso thumbnails up to date');

    if (thumbnailCount.focus < focusSupply) {
      context.log.info('Focus thumbnails missing, creating...');
      const focusThumbnails = await getThumbnailsByProject(conn, 'focus');
      const focusArtBlocksId = 181000000;

      const thumbnailsAdded = await processThumbnails(
        conn,
        focusSupply,
        'focus',
        focusArtBlocksId,
        focusThumbnails,
        context,
      );

      context.log.info(`Added ${thumbnailsAdded} Focus thumbnails`);
    } else context.log.info('Focus thumbnails up to date');
  } catch (error) {
    context.log.error('ArtBlocksThumbnails function error', error);
    if (process.env.NODE_ENV === 'test') console.error(error);
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default timerTrigger;
