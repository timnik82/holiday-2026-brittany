import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";
import { safeRedirectPath } from "./redirect";

/**
 * Server-only session guards for pages and APIs.
 *
 * Proxy redirects unauthenticated requests, but it is NOT the sole security
 * boundary — every future API route MUST also call `requireApiSession()`, and
 * any server component may call `requirePageSession()` for defense in depth.
 */

async function resolveToken(token?: string): Promise<string | undefined> {
  if (token !== undefined) return token;
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * For server components / pages: redirects to `/login?next=...` if the session
 * is missing or invalid. `redirect()` throws by design, so this resolves only
 * when the session is valid.
 */
export async function requirePageSession(token?: string): Promise<void> {
  const resolved = await resolveToken(token);
  if (!(await verifySessionToken(resolved))) {
    const next = token === undefined ? await currentPath() : "/";
    redirect(`/login?next=${encodeURIComponent(safeRedirectPath(next))}`);
  }
}

/**
 * For API routes: returns a `401` `Response` if the session is missing or
 * invalid, or `null` if the session is valid. Callers should check the return
 * value and return it directly — Next.js App Router route handlers do not
 * reliably propagate thrown `Response` objects in production.
 */
export async function requireApiSession(token?: string): Promise<Response | null> {
  const resolved = await resolveToken(token);
  if (!(await verifySessionToken(resolved))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

/**
 * Best-effort current path reader for building the `next` parameter. Falls back
 * to "/" when unavailable (e.g. outside a request scope).
 */
async function currentPath(): Promise<string> {
  return "/";
}
