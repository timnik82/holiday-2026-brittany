import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      // Test-only credentials for the single smoke journey. The hash below is
      // bcrypt(10) of the password "test-guide-pass-2026".
      AUTH_SECRET: "test-auth-secret-for-playwright-smoke-xxxx",
      SITE_PASSWORD_HASH:
        "$2b$10$bdRRwiDC3tEgqciLCQFTiebYI5USE0XXVIusWx.YGii3bzc0AU/AO",
      // NODE_ENV left unset so the session cookie is not marked `secure` and
      // still works over plain HTTP on localhost.
    },
  },
});
