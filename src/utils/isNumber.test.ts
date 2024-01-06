import { isNumber } from "./typeChecks";

describe("isNumber", () => {
  it("returns true when given a number", () => {
    expect(isNumber(42)).toBe(true);
  });

  it("returns false when given a string", () => {
    expect(isNumber("42")).toBe(false);
  });

  it("returns false when given undefined", () => {
    expect(isNumber(undefined)).toBe(false);
  });
});
