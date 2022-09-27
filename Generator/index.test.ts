import { Context } from '@azure/functions';
import httpTrigger from './index';

describe('Generator', () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: { error: jest.fn() },
      bindingData: { project_slug: 'chainlife', token_id: '1' },
    } as unknown as Context;
  });

  it('should return a 404 if given an incorrect project slug', async () => {
    context.bindingData.project_slug = 'cryptodickbutts';

    await httpTrigger(context);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(404);
    expect(context.res.body).toEqual('Project not found');
  });

  it('should return a 500 and throw error if given nonexistant token', async () => {
    context.bindingData.token_id = '69420';

    await httpTrigger(context);

    expect(context.log.error).toBeCalledTimes(1);
    expect(context.res.status).toEqual(500);
  });

  it('should return a 200 with correct info', async () => {
    await httpTrigger(context);

    jest.setTimeout(30000);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(typeof context.res.body).toBe('string');
  });
});
