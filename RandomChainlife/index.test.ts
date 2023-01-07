import { Context } from '@azure/functions';
import httpTrigger from './index';

describe('Random Chainlife', () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: { error: jest.fn(), info: jest.fn() },
    } as unknown as Context;
  });

  it('should return a 200', async () => {
    await httpTrigger(context);

    expect(context?.res?.status).toEqual(200);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context?.res?.body).toBe('string');
  });
});
