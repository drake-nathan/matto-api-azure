import { isProjectSlug } from "./typeChecks";

describe("isProjectSlug", () => {
  it("returns true when given valid ProjectSlug", () => {
    expect(isProjectSlug("chainlife")).toBe(true);
  });

  it("returns false when given invalid ProjectSlug", () => {
    expect(isProjectSlug("not-a-project-slug")).toBe(false);
  });

  it("returns false when given invalid type", () => {
    expect(isProjectSlug(42)).toBe(false);
  });

  it("returns false when given undefined", () => {
    expect(isProjectSlug(undefined)).toBe(false);
  });

  it("returns false when empty string", () => {
    expect(isProjectSlug("")).toBe(false);
  });
});
