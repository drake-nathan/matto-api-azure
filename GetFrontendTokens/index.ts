import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { getProject } from '../src/db/queries/projectQueries';
import {
  getTokenAbbr,
  getTokensTokenIdSort,
  getTokensWorldLevelSort,
} from '../src/db/queries/tokenQueries';
import { TokenAbbr } from '../src/db/schemas/schemaTypes';

const httpTrigger: AzureFunction = async (
  context: Context,
  req: HttpRequest,
): Promise<void> => {
  const { project_slug } = context.bindingData;
  const {
    limit: limitQuery,
    skip: skipQuery,
    sortDir: sortDirQuery,
    sortType: sortTypeQuery,
    tokenId: tokenIdQuery,
  } = req.query;
  let conn: Connection | undefined;

  // check if limit query is a number
  const limit = limitQuery && Number(limitQuery) ? Number(limitQuery) : 16;
  const skip = skipQuery && Number(skipQuery) ? Number(skipQuery) : 0;
  const sort = sortDirQuery === 'asc' || sortDirQuery === 'desc' ? sortDirQuery : 'asc';
  const sortType =
    sortTypeQuery === 'tokenId' || sortTypeQuery === 'worldLevel'
      ? sortTypeQuery
      : 'tokenId';

  // validate tokenId query, hard code 0 since Number('0') is falsy
  const tokenIdNum = tokenIdQuery && Number(tokenIdQuery) ? Number(tokenIdQuery) : null;
  const tokenId = tokenIdQuery === '0' ? 0 : tokenIdNum;

  if (tokenIdQuery && !tokenId) {
    context.res = {
      status: 404,
      body: 'Invalid tokenId query',
    };
    return;
  }

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

    let tokens: TokenAbbr[] = [];
    let hasMore = false;

    if (tokenId) {
      const token = await getTokenAbbr(project_slug, tokenId, conn);
      if (token) tokens.push(token);
      hasMore = false;
    } else if (sortType === 'tokenId') {
      tokens = await getTokensTokenIdSort(conn, project_slug, limit, skip, sort);
      hasMore = project.current_supply ? project.current_supply > skip + limit : false;
    } else if (sortType === 'worldLevel') {
      tokens = await getTokensWorldLevelSort(conn, project_slug, limit, skip, sort);
      hasMore = project.current_supply ? project.current_supply > skip + limit : false;
    }

    if (!tokens.length) {
      context.res = {
        status: 404,
        body: 'Tokens not found',
      };
      return;
    }

    context.res = {
      status: 200,
      body: {
        hasMore,
        skip,
        currentSupply: project.current_supply,
        tokens,
      },
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
