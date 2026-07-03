import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "../redirect";

describe("safeRedirectPath", () => {
  it("accepts the root path", () => {
    expect(safeRedirectPath("/")).toBe("/");
  });

  it("accepts a relative app path", () => {
    expect(safeRedirectPath("/bases")).toBe("/bases");
  });

  it("accepts a relative app path with a query string", () => {
    expect(safeRedirectPath("/swimming?x=1")).toBe("/swimming?x=1");
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/");
  });

  it("rejects an absolute URL", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/");
  });

  it("rejects undefined", () => {
    expect(safeRedirectPath(undefined)).toBe("/");
  });

  it("rejects an empty string", () => {
    expect(safeRedirectPath("")).toBe("/");
  });
});
