import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

/**
 * Next.js 16 request interception (the `proxy.ts` convention).
 *
 * Redirects unauthenticated page/RSC requests to `/login`. This is an
 * optimistic boundary: every API route and any sensitive server component must
 * STILL call `requireApiSession()` / `requirePageSession()`. Proxy is NOT the
 * sole security boundary.
 *
 * Edge runtime: only `jose` + `TextEncoder` (via session.ts) are imported.
 * `bcrypt` is intentionally never imported here.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The login page and its server action must remain reachable while signed out.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!(await verifySessionToken(token))) {
    const url = new URL(
      `/login?next=${encodeURIComponent(pathname + search)}`,
      request.url,
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, static assets, and (future) API routes. API routes
  // enforce their own `requireApiSession()` and are intentionally not handled
  // here so they can return a clean 401 instead of an HTML redirect.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
