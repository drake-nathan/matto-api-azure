import type { Context, HttpRequest } from "@azure/functions";

import httpTrigger from "./index";

describe("Generator", () => {
  let context: Context;
  let req: HttpRequest;

  beforeEach(() => {
    context = {
      bindingData: { project_slug: "chainlife-testnet", token_id: "1" },
      log: { error: jest.fn(), info: jest.fn() },
    } as unknown as Context;

    req = {
      body: {},
    } as unknown as HttpRequest;
  });

  it("should return a 404 if given an incorrect project slug", async () => {
    context.bindingData.project_slug = "cryptodickbutts";

    await httpTrigger(context, req);

    expect(context.res?.status).toEqual(404);
    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(typeof context.res?.body).toBe("string");
  });

  it("should return a 404 if project does not have gen_scripts", async () => {
    context.bindingData.project_slug = "texture-and-hues";

    await httpTrigger(context, req);

    expect(context.res?.status).toEqual(404);
    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(typeof context.res?.body).toBe("string");
  });

  it("should return a 404 if given nonexistant token", async () => {
    context.bindingData.token_id = "69420";

    await httpTrigger(context, req);

    expect(context.res?.status).toEqual(404);
    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(typeof context.res?.body).toBe("string");
  });

  it("should return a 200 with correct info", async () => {
    await httpTrigger(context, req);

    expect(context.res?.status).toEqual(200);
    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(typeof context.res?.body).toBe("string");
  });

  it("should return a 200 if given body scriptInputs", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    req.body.scriptInputs = {
      current_owner: "0xe4c8efd2ed3051b22ea3eede1af266452b0e66e9",
      custom_rule: "",
      previous_owner: "0x0bbae40fa21de159c8a88e74826ebd39e9a729f8",
      token_entropy:
        "0x6061425B6961DE47961752967C51AD163519BF0BF90409D1E1ADF30D3134F00D",
      token_id: "0",
      transfer_count: "1",
    };

    await httpTrigger(context, req);

    expect(context.res?.status).toEqual(200);
    expect(context.log.info).toHaveBeenCalledTimes(1);
    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(typeof context.res?.body).toBe("string");
  });
});
