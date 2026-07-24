const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Lets the local `next dev` preview show pages without a family session.
 *
 * Both checks are deliberate: production/Preview builds never bypass auth,
 * and a development server reached from another device on the LAN remains
 * protected.
 */
export function canBypassPageAuth(
  hostname: string,
  nodeEnv = process.env.NODE_ENV,
): boolean {
  return nodeEnv === "development" && LOOPBACK_HOSTNAMES.has(hostname);
}
