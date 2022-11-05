import { Context } from '@azure/functions';
import httpTrigger from './index';

describe('GetThumbnail', () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: { error: jest.fn() },
      bindingData: { artblocks_id: 34000420 },
    } as unknown as Context;
  });

  it('should return a 404 if given an incorrect artblocks id', async () => {
    context.bindingData.artblocks_id = 69;

    await httpTrigger(context);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(404);
    expect(context.res.body).toEqual('Thumbnail not found');
  });

  it('should return a 200 with a real artblocks id', async () => {
    await httpTrigger(context);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context.res.status).toEqual(200);
    expect(typeof context.res.body).toBe('object');
  });
});
