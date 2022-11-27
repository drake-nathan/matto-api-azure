import { Context, HttpRequest } from '@azure/functions';
import GetFrontenTokens from './index';

describe('GetFrontendTokens', () => {
  let context: Context;
  let req: HttpRequest;

  beforeEach(() => {
    context = {
      log: { error: jest.fn() },
      bindingData: { project_slug: 'chainlife-testnet' },
    } as unknown as Context;
    req = { query: {} } as unknown as HttpRequest;
  });

  it('should return a 404 if given an incorrect project slug', async () => {
    context.bindingData.project_slug = 'cryptodickbutts';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(404);
    expect(context.res.body).toEqual('Project not found');
  });

  it('should return a response object with default values if no queries given', async () => {
    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body).toHaveProperty('currentSupply');
    expect(context.res.body.tokens).toHaveLength(16);
    expect(context.res.body.tokens[0].token_id).toEqual(0);
  });

  it('should limit the number of tokens returned if given a limit query', async () => {
    req.query.limit = '10';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(10);
    expect(context.res.body.tokens[0].token_id).toEqual(0);
  });

  it('should skip the number of tokens returned if given a skip query', async () => {
    req.query.skip = '10';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(16);
    expect(context.res.body.tokens[0].token_id).toEqual(10);
  });

  it('should sort the tokens by token id if given a sortDir query', async () => {
    req.query.sortDir = 'desc';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(16);
    expect(context.res.body.tokens[0].token_id).toBeGreaterThan(0);
  });

  it('should sort the tokens by world level if given sortType query', async () => {
    req.query.sortType = 'worldLevel';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(16);
    expect(context.res.body.tokens[0]).toHaveProperty('world_level');
  });

  it('should set hasMore to true if there are more tokens to be returned', async () => {
    req.query.limit = '3';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body.hasMore).toEqual(true);
  });

  it('should return one token if given valid tokenId query', async () => {
    req.query.tokenId = '69';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body.hasMore).toEqual(false);
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(1);
    expect(context.res.body.tokens[0].token_id).toEqual(69);
  });

  it('should return 404 if given invalid tokenId query', async () => {
    req.query.tokenId = '42069';

    await GetFrontenTokens(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(404);
    expect(context.res.body).toEqual('Tokens not found');
  });
});
