import type { Context } from "@azure/functions";

import httpTrigger from "./index";

describe("GetThumbnail", () => {
  let context: Context;

  beforeEach(() => {
    context = {
      bindingData: { artblocks_id: 34000420 },
      log: { error: jest.fn() },
    } as unknown as Context;
  });

  it("should return a 404 if given an incorrect artblocks id", async () => {
    context.bindingData.artblocks_id = 69;

    await httpTrigger(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(404);
    expect(context.res?.body).toBe("Thumbnail not found");
  });

  it("should return a 200 with a real artblocks id", async () => {
    await httpTrigger(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(typeof context.res?.body).toBe("object");
  });
});
