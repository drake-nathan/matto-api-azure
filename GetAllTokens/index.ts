import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { getProject } from '../src/db/queries/projectQueries';
import { getTokensForFrontend } from '../src/db/queries/tokenQueries';

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest,
): Promise<void> => {
  const { project_slug } = context.bindingData;
  const { limit: limitQuery, skip: skipQuery, sort: sortQuery } = req.query;
  let conn: Connection;

  // default values

  // check if limit query is a number
  const limit = limitQuery && Number(limitQuery) ? Number(limitQuery) : 16;
  const skip = skipQuery && Number(skipQuery) ? Number(skipQuery) : 0;
  const sort = sortQuery === 'asc' || sortQuery === 'desc' ? sortQuery : 'asc';

  try {
    conn = await connectionFactory(context);

    const project = await getProject(project_slug, conn);

    if (!project) {
      context.res = {
        status: 404,
        body: 'Project not found',
      };
      return;
    }

    const tokens = await getTokensForFrontend(conn, project_slug, limit, skip, sort);

    if (!tokens) {
      context.res = {
        status: 404,
        body: 'Tokens not found',
      };
      return;
    }

    const hasMore = project.current_supply > skip + limit;

    context.res = {
      status: 200,
      body: {
        hasMore,
        tokens,
      },
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: 'Internal Server Error',
    };
  } finally {
    await conn.close();
  }
};

export default httpTrigger;
