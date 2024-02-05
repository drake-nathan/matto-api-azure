import type { Context } from "@azure/functions";

import httpTrigger from "./index";

describe("GetTxCount", () => {
  let context: Context;

  beforeEach(() => {
    context = {
      bindingData: { project_slug: "chainlife-testnet" },
      log: { error: jest.fn() },
    } as unknown as Context;
  });

  it("should return a 404 if given an incorrect project slug", async () => {
    context.bindingData.project_slug = "cryptodickbutts";

    await httpTrigger(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(404);
    expect(context.res?.body).toBe("Invalid project slug");
  });

  it("should return a 200 with tx counts object", async () => {
    await httpTrigger(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(typeof context.res?.body).toBe("object");
    expect(context.res?.body).toHaveProperty("total");
    expect(context.res?.body).toHaveProperty("mints");
    expect(context.res?.body).toHaveProperty("transfers");
    expect(context.res?.body).toHaveProperty("customRules");
    expect(context.res?.body).toHaveProperty("levelShifts");
  });
});
