import { test, expect } from "@playwright/test";

// This is the application's single whole-app end-to-end journey. The test
// password and its committed bcrypt hash are configured for the Playwright
// webServer in playwright.config.ts (test-only credentials).
const TEST_PASSWORD = "test-guide-pass-2026";

test("home page requires sign-in and is reachable after authenticating", async ({
  page,
}) => {
  // Unauthenticated requests are redirected to the login screen by the proxy.
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Sign in/i }),
  ).toBeVisible();

  // Authenticate with the configured private-family password.
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // After sign-in the original destination (the home page) is shown.
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Holiday 2026 — Brittany Family Guide/i,
    }),
  ).toBeVisible();

  const nav = page.getByRole("navigation", { name: /primary/i });
  await expect(nav).toBeVisible();

  for (const label of [
    "Compare bases",
    "Routes",
    "Things to do",
    "Swimming",
    "Plan your trip",
  ]) {
    await expect(nav.getByText(label)).toBeVisible();
  }
});
