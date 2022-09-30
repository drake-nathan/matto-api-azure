import { Context } from '@azure/functions';
import httpTrigger from './index';

describe('Generator', () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: { error: jest.fn(), info: jest.fn() },
      bindingData: { project_slug: 'chainlife' },
    } as unknown as Context;
  });

  it('should return a 404 if given an incorrect project slug', async () => {
    context.bindingData.project_slug = 'cryptodickbutts';

    await httpTrigger(context);

    expect(context.res.status).toEqual(404);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context.res.body).toBe('string');
  });

  it('should return a 200 with array', async () => {
    await httpTrigger(context);

    expect(context.res.status).toEqual(200);
    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.body).toEqual(expect.any(Array));
  });
});
