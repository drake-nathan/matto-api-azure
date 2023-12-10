import { Context } from "@azure/functions";

import convertTokenZero from "./index";

describe("ConvertTokenZero", () => {
  let context: Context;

  beforeEach(() => {
    context = {
      log: { error: jest.fn(), info: jest.fn() },
      bindingData: { project_slug: "chainlife-testnet", token_id: "1" },
    } as unknown as Context;
  });

  it("should return a 200 with a real project slug", async () => {
    await convertTokenZero(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.log.info).toHaveBeenCalledTimes(2);
    expect(context?.res?.status).toEqual(200);
    expect(typeof context?.res?.body).toBe("object");
  }, 30000);
});
