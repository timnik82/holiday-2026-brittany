// @vitest-environment node
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { canBypassPageAuth } from "./local-development";

const packageJson = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8"),
) as { scripts: Record<string, string> };

describe("local development page authentication bypass", () => {
  it("binds the development server to this computer only", () => {
    expect(packageJson.scripts.dev).toContain("--hostname 127.0.0.1");
  });

  it.each(["localhost", "127.0.0.1", "[::1]"])(
    "allows %s only during development",
    (hostname) => {
      expect(canBypassPageAuth(hostname, "development")).toBe(true);
      expect(canBypassPageAuth(hostname, "production")).toBe(false);
      expect(canBypassPageAuth(hostname, "test")).toBe(false);
    },
  );

  it.each(["192.168.1.206", "holiday-2026-brittany.vercel.app"])(
    "keeps %s protected during development",
    (hostname) => {
      expect(canBypassPageAuth(hostname, "development")).toBe(false);
    },
  );
});
