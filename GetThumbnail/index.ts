import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { getThumbnail } from '../src/db/queries/thumbnailQueries';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const { artblocks_id } = context.bindingData;
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const thumbnail = await getThumbnail(conn, artblocks_id);

    if (!thumbnail) {
      context.res = {
        status: 404,
        body: 'Thumbnail not found',
      };
      return;
    }

    context.res = {
      status: 200,
      body: thumbnail,
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === 'test') console.error(error);
    context.res = {
      status: 500,
      body: 'Internal Server Error',
    };
  } finally {
    if (conn) await conn.close();
  }
};

export default httpTrigger;
