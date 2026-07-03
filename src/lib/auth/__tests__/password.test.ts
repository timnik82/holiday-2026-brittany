import { beforeAll, describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a Server Component. Stub it so the
// guard module can be exercised in the unit-test environment.
vi.mock("server-only", () => ({}));

import bcrypt from "bcryptjs";
import { verifyPassword } from "../password";

const CORRECT = "correct-horse";

describe("verifyPassword", () => {
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash(CORRECT, 10);
  });

  it("returns true for the correct password", async () => {
    expect(await verifyPassword(CORRECT, hash)).toBe(true);
  });

  it("returns false for a wrong password", async () => {
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("returns false for empty input", async () => {
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("returns false (never throws) for a malformed hash", async () => {
    expect(await verifyPassword(CORRECT, "not-a-real-bcrypt-hash")).toBe(false);
  });
});
