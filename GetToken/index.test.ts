import { Context } from "@azure/functions";

import httpTrigger from "./index";

describe("GetToken", () => {
  let context: Context;

  beforeEach(() => {
    context = {
      bindingData: { project_slug: "chainlife-testnet", token_id: "1" },
      log: { error: jest.fn() },
    } as unknown as Context;
  });

  it("should return a 404 if given an incorrect project slug", async () => {
    context.bindingData.project_slug = "cryptodickbutts";

    await httpTrigger(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context?.res?.status).toEqual(404);
    expect(context?.res?.body).toEqual("Project not found");
  });

  it("should return a 404 if given nonexistant token", async () => {
    context.bindingData.token_id = "69420";

    await httpTrigger(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context?.res?.status).toEqual(404);
    expect(context?.res?.body).toEqual("Token not found");
  });

  it("should return a 200 with a real project slug", async () => {
    await httpTrigger(context);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context?.res?.status).toEqual(200);
    expect(typeof context?.res?.body).toBe("object");
  });
});
