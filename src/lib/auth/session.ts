import { SignJWT, jwtVerify } from "jose";
import { requireEnv } from "./env";

/**
 * Stateless session helpers.
 *
 * Edge-safe: this module only depends on `jose` and `TextEncoder`, so it can be
 * imported from the Next.js proxy (edge runtime). It deliberately does NOT
 * import `bcrypt` or `next/headers`.
 */

export const SESSION_COOKIE_NAME = "brittany_session";

/** 30 days, in seconds. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret(): Uint8Array {
  return new TextEncoder().encode(requireEnv("AUTH_SECRET"));
}

/**
 * Signs a stateless session token. Returns a signed HS256 JWT asserting
 * `{ authenticated: true, expiresAt }`. Throws if AUTH_SECRET is unset.
 */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(getSecret());
}

/**
 * Returns true only if the token has a valid signature and has not expired.
 * Returns false for undefined, malformed, tampered, expired, or differently
 * signed tokens. Never throws.
 */
export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

/**
 * Cookie attributes for the session cookie.
 * `secure` is true only in production, so the cookie still works over plain HTTP
 * during local development and Playwright runs against `npm run start` on localhost.
 */
export function sessionCookieAttributes(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
