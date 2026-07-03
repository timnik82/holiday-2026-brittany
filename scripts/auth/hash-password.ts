/**
 * Generate a bcrypt hash for the private family password.
 *
 * Usage:
 *   npx tsx scripts/auth/hash-password.ts "your-password"
 *
 * Print the resulting hash, then set it as `SITE_PASSWORD_HASH` in your local
 * `.env` (gitignored) or your deployment environment variables. The hash is
 * what the server compares the submitted password against.
 */
import bcrypt from "bcryptjs";

async function main(): Promise<void> {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npx tsx scripts/auth/hash-password.ts "your-password"');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
