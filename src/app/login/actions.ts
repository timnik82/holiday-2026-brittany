"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getConfiguredPasswordHash, verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieAttributes,
} from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/redirect";

/**
 * Verifies the submitted password against the configured bcrypt hash and, on
 * success, sets a stateless session cookie and redirects to the validated
 * `next` path. A blank and an incorrect password produce the SAME user-facing
 * error so the form never reveals which it was.
 */
export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(String(formData.get("next") ?? "/"));

  // Missing hash is a deploy-time configuration error, not a user-facing one;
  // surfacing the same login error keeps that mistake private while still
  // blocking access.
  const hash = getConfiguredPasswordHash();
  const ok = await verifyPassword(password, hash);

  if (!ok) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE_NAME, token, sessionCookieAttributes());
  redirect(next);
}

/**
 * Clears the session cookie and returns to the login screen.
 */
export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
