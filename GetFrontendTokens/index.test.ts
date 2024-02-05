import type { Context, HttpRequest } from "@azure/functions";

import GetFrontenTokens from "./index";

describe("GetFrontendTokens", () => {
  let context: Context;
  let req: HttpRequest;

  beforeEach(() => {
    context = {
      bindingData: { project_slug: "chainlife-testnet" },
      log: { error: jest.fn() },
    } as unknown as Context;
    req = { query: {} } as unknown as HttpRequest;
  });

  it("should return a 404 if given an incorrect project slug", async () => {
    context.bindingData.project_slug = "cryptodickbutts";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(404);
    expect(context.res?.body).toBe("Project not found");
  });

  it("should return a response object with default values if no queries given", async () => {
    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toHaveProperty("hasMore");
    expect(context.res?.body).toHaveProperty("tokens");
    expect(context.res?.body).toHaveProperty("currentSupply");
    expect(context.res?.body.tokens).toHaveLength(16);
    expect(context.res?.body.tokens[0].token_id).toBe(0);
  });

  it("should limit the number of tokens returned if given a limit query", async () => {
    req.query.limit = "10";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toHaveProperty("hasMore");
    expect(context.res?.body).toHaveProperty("tokens");
    expect(context.res?.body.tokens).toHaveLength(10);
    expect(context.res?.body.tokens[0].token_id).toBe(0);
  });

  it("should skip the number of tokens returned if given a skip query", async () => {
    req.query.skip = "10";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toHaveProperty("hasMore");
    expect(context.res?.body).toHaveProperty("tokens");
    expect(context.res?.body.tokens).toHaveLength(16);
    expect(context.res?.body.tokens[0].token_id).toBe(10);
  });

  it("should sort the tokens by token id if given a sortDir query", async () => {
    req.query.sortDir = "desc";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toHaveProperty("hasMore");
    expect(context.res?.body).toHaveProperty("tokens");
    expect(context.res?.body.tokens).toHaveLength(16);
    expect(context.res?.body.tokens[0].token_id).toBeGreaterThan(0);
  });

  it("should sort the tokens by world level if given sortType query", async () => {
    req.query.sortType = "worldLevel";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toHaveProperty("hasMore");
    expect(context.res?.body).toHaveProperty("tokens");
    expect(context.res?.body.tokens).toHaveLength(16);
    expect(context.res?.body.tokens[0]).toHaveProperty("world_level");
  });

  it("should set hasMore to true if there are more tokens to be returned", async () => {
    req.query.limit = "3";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toHaveProperty("hasMore");
    expect(context.res?.body.hasMore).toBe(true);
  });

  it("should return one token if given valid tokenId query", async () => {
    req.query.tokenId = "69";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toHaveProperty("hasMore");
    expect(context.res?.body.hasMore).toBe(false);
    expect(context.res?.body).toHaveProperty("tokens");
    expect(context.res?.body.tokens).toHaveLength(1);
    expect(context.res?.body.tokens[0].token_id).toBe(69);
  });

  it("should return 404 if given invalid tokenId query", async () => {
    req.query.tokenId = "not a token";

    await GetFrontenTokens(context, req);

    expect(context.log.error).toHaveBeenCalledTimes(0);
    expect(context.res?.status).toBe(404);
    expect(context.res?.body).toBe("Invalid tokenId query");
  });
});
