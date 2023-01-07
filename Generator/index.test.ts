import { Context, HttpRequest } from '@azure/functions';
import httpTrigger from './index';

describe('Generator', () => {
  let context: Context;
  let req: HttpRequest;

  beforeEach(() => {
    context = {
      log: { error: jest.fn(), info: jest.fn() },
      bindingData: { project_slug: 'chainlife-testnet', token_id: '1' },
    } as unknown as Context;

    req = {
      body: {},
    } as unknown as HttpRequest;
  });

  it('should return a 404 if given an incorrect project slug', async () => {
    context.bindingData.project_slug = 'cryptodickbutts';

    await httpTrigger(context, req);

    expect(context?.res?.status).toEqual(404);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context?.res?.body).toBe('string');
  });

  it('should return a 404 if given nonexistant token', async () => {
    context.bindingData.token_id = '69420';

    await httpTrigger(context, req);

    expect(context?.res?.status).toEqual(404);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context?.res?.body).toBe('string');
  });

  it('should return a 200 with correct info', async () => {
    await httpTrigger(context, req);

    expect(context?.res?.status).toEqual(200);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context?.res?.body).toBe('string');
  });

  it('should return a 200 if given body scriptInputs', async () => {
    req.body.scriptInputs = {
      token_id: '0',
      token_entropy: '0x6061425B6961DE47961752967C51AD163519BF0BF90409D1E1ADF30D3134F00D',
      previous_owner: '0x0bbae40fa21de159c8a88e74826ebd39e9a729f8',
      current_owner: '0xe4c8efd2ed3051b22ea3eede1af266452b0e66e9',
      transfer_count: '1',
      custom_rule: '',
    };

    await httpTrigger(context, req);

    expect(context?.res?.status).toEqual(200);
    expect(context.log.info).toBeCalledTimes(1);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context?.res?.body).toBe('string');
  });
});
