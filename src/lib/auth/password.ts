import "server-only";

import bcrypt from "bcryptjs";
import { requireEnv } from "./env";

/**
 * Server-only password helpers (bcrypt requires the Node runtime and must never
 * be imported from the edge proxy).
 */

/**
 * Verifies `input` against a stored bcrypt `hash`. Returns false on mismatch or
 * any error (e.g. malformed hash). Never throws — callers can use the same
 * user-facing error for a wrong and a blank password.
 */
export async function verifyPassword(
  input: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(input, hash);
  } catch {
    return false;
  }
}

/**
 * Reads and returns the configured `SITE_PASSWORD_HASH`. Throws a configuration
 * error if it is missing — this is a deploy-time mistake, not a user-facing one.
 */
export function getConfiguredPasswordHash(): string {
  return requireEnv("SITE_PASSWORD_HASH");
}
