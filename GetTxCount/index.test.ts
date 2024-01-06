import { Context } from "@azure/functions";

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

    expect(context.log.error).toBeCalledTimes(0);
    expect(context?.res?.status).toEqual(404);
    expect(context?.res?.body).toEqual("Invalid project slug");
  });

  it("should return a 200 with tx counts object", async () => {
    await httpTrigger(context);

    expect(context.log.error).toBeCalledTimes(0);
    expect(context?.res?.status).toEqual(200);
    expect(typeof context?.res?.body).toBe("object");
    expect(context?.res?.body).toHaveProperty("total");
    expect(context?.res?.body.total).toBeGreaterThan(0);
    expect(context?.res?.body).toHaveProperty("mints");
    expect(context?.res?.body.mints).toBeGreaterThan(0);
    expect(context?.res?.body).toHaveProperty("transfers");
    expect(context?.res?.body.transfers).toBeGreaterThanOrEqual(0);
    expect(context?.res?.body).toHaveProperty("customRules");
    expect(context?.res?.body.customRules).toBeGreaterThanOrEqual(0);
    expect(context?.res?.body).toHaveProperty("levelShifts");
    expect(context?.res?.body.levelShifts).toBeGreaterThanOrEqual(0);
  });
});
