import { Context } from '@azure/functions';
import httpTrigger from './index';

describe('GetProject', () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: { error: jest.fn() },
      bindingData: { project_slug: 'chainlife' },
    } as unknown as Context;
  });

  it('should return a 404 if given an incorrect project slug', async () => {
    context.bindingData.project_slug = 'cryptodickbutts';

    await httpTrigger(context);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(404);
  });

  it('should return a 200 with a real project slug', async () => {
    await httpTrigger(context);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(typeof context.res.body).toBe('object');
  });
});
