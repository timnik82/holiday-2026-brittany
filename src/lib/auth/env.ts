/**
 * Edge-safe environment variable reader.
 *
 * Reads the variable lazily (inside functions, never at module top-level) so
 * that importing this module — or a module that imports it — never fails during
 * build/bundling when a secret is not yet present. Secrets are only required at
 * request time.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}
