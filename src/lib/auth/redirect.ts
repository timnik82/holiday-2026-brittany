/**
 * Returns a safe same-origin redirect path.
 *
 * Accepts only paths that start with a single `/` (so relative app paths like
 * `/bases`, `/swimming?x=1`). Rejects protocol-relative URLs (`//evil.com`),
 * absolute URLs (`https://evil.com`), backslashes, empty strings, null, and
 * undefined. Anything rejected collapses to `/`.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (typeof next !== "string" || next.length === 0) return "/";
  if (!next.startsWith("/")) return "/";
  // Reject protocol-relative and escaped-separator redirects like "//evil.com"
  // or "/\"evil.com".
  if (next.startsWith("//")) return "/";
  if (next.startsWith("/\\")) return "/";
  return next;
}
