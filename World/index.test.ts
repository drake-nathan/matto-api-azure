import { Context } from "@azure/functions";

import httpTrigger from "./index";

describe("World", () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: { error: jest.fn(), info: jest.fn() },
      bindingData: { project_slug: "chainlife-testnet", token_id: "1" },
    } as unknown as Context;
  });

  it("should return a 404 if given an incorrect project slug", async () => {
    context.bindingData.project_slug = "cryptodickbutts";

    await httpTrigger(context);

    expect(context?.res?.status).toEqual(404);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context?.res?.body).toBe("string");
  });

  it("should return a 200 with correct info", async () => {
    await httpTrigger(context);

    expect(context?.res?.status).toEqual(200);
    expect(context.log.error).toBeCalledTimes(0);
    expect(typeof context?.res?.body).toBe("string");
  });
});
