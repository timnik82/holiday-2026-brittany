// @vitest-environment node
// jose v6's WebCrypto-backed build trips on cross-realm `Uint8Array instanceof`
// checks under jsdom; run these guard tests in the Node environment.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a Server Component. Stub it so the
// guard modules can be exercised in the unit-test environment.
vi.mock("server-only", () => ({}));

import {
  requireApiSession,
  requirePageSession,
} from "../require-session";
import { createSessionToken } from "../session";

const TEST_SECRET = "test-secret-at-least-32-characters-long-xxxxx";

describe("require-session guards", () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    delete process.env.AUTH_SECRET;
  });

  it("requirePageSession resolves when given a valid token", async () => {
    const token = await createSessionToken();
    await expect(requirePageSession(token)).resolves.toBeUndefined();
  });

  it("requirePageSession throws (redirect) for an invalid token", async () => {
    await expect(requirePageSession("not-a-real-token")).rejects.toThrow();
  });

  it("requireApiSession resolves to null when given a valid token", async () => {
    const token = await createSessionToken();
    await expect(requireApiSession(token)).resolves.toBeNull();
  });

  it("requireApiSession returns a 401 Response for an invalid token", async () => {
    const result = await requireApiSession("not-a-real-token");
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });
});
