import { Context, HttpRequest } from '@azure/functions';
import httpTrigger from './index';

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

    await httpTrigger(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(404);
    expect(context.res.body).toEqual('Project not found');
  });

  it('should return a response object with default values if no queries given', async () => {
    await httpTrigger(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(16);
    expect(context.res.body.tokens[0].token_id).toEqual(0);
  });

  it('should limit the number of tokens returned if given a limit query', async () => {
    req.query.limit = '10';

    await httpTrigger(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(10);
    expect(context.res.body.tokens[0].token_id).toEqual(0);
  });

  it('should skip the number of tokens returned if given a skip query', async () => {
    req.query.skip = '10';

    await httpTrigger(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(16);
    expect(context.res.body.tokens[0].token_id).toEqual(10);
  });

  it('should sort the tokens returned if given a sort query', async () => {
    req.query.sort = 'desc';

    await httpTrigger(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body).toHaveProperty('tokens');
    expect(context.res.body.tokens).toHaveLength(16);
    expect(context.res.body.tokens[0].token_id).toBeGreaterThan(0);
  });

  it('should set hasMore to true if there are more tokens to be returned', async () => {
    req.query.limit = '3';

    await httpTrigger(context, req);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toHaveProperty('hasMore');
    expect(context.res.body.hasMore).toEqual(true);
  });
});
