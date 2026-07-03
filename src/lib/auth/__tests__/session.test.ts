// @vitest-environment node
// jose v6 uses the WebCrypto-backed webapi build. Under the default jsdom test
// environment the cross-realm `Uint8Array instanceof` checks inside jose fail,
// so these stateless-session tests run in the Node environment instead.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  sessionCookieAttributes,
  verifySessionToken,
} from "../session";

const TEST_SECRET = "test-secret-at-least-32-characters-long-xxxxx";

describe("session token", () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    delete process.env.AUTH_SECRET;
  });

  it("exposes the expected cookie name and max age", () => {
    expect(SESSION_COOKIE_NAME).toBe("brittany_session");
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 30);
  });

  it("creates a non-empty token that verifies", async () => {
    const token = await createSessionToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    expect(await verifySessionToken(token)).toBe(true);
  });

  it("returns false for a tampered token", async () => {
    const token = await createSessionToken();
    // Flip the last base64url char to a different one.
    const last = token[token.length - 1];
    const replacement = last === "A" ? "B" : "A";
    const tampered = token.slice(0, -1) + replacement;
    expect(await verifySessionToken(tampered)).toBe(false);
  });

  it("returns false for undefined", async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
  });

  it("returns false for a token signed with a different secret", async () => {
    const token = await createSessionToken();
    process.env.AUTH_SECRET = "a-completely-different-secret-value-aaaaaa";
    try {
      expect(await verifySessionToken(token)).toBe(false);
    } finally {
      process.env.AUTH_SECRET = TEST_SECRET;
    }
  });

  it("returns cookie attributes with the expected secure defaults", () => {
    const attrs = sessionCookieAttributes();
    expect(attrs.httpOnly).toBe(true);
    expect(attrs.sameSite).toBe("lax");
    expect(attrs.path).toBe("/");
    expect(attrs.maxAge).toBe(SESSION_MAX_AGE_SECONDS);
  });

  it("throws when AUTH_SECRET is unset", async () => {
    const saved = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    try {
      let threw = false;
      try {
        await createSessionToken();
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    } finally {
      process.env.AUTH_SECRET = saved;
    }
  });
});
