import { test, expect } from "@playwright/test";

// This is the application's single whole-app end-to-end journey. The test
// password and its committed bcrypt hash are configured for the Playwright
// webServer in playwright.config.ts (test-only credentials).
const TEST_PASSWORD = "test-guide-pass-2026";

test("sign-in journey: home, one attraction, and one stay", async ({ page }) => {
  // Unauthenticated requests are redirected to the login screen by the proxy.
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Sign in/i }),
  ).toBeVisible();

  // Authenticate with the configured private-family password.
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // After sign-in the home page is shown: the booked trip, not a recommendation.
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /The trip, day by day/i }),
  ).toBeVisible();

  // A date inside the trip resolves to the stay whose night is spent there.
  await page.goto("/?date=2026-08-14");
  await expect(
    page.getByRole("heading", { level: 2, name: /Quimper \/ South Finistère/i }),
  ).toBeVisible();

  const nav = page.getByRole("navigation", { name: /primary/i });
  await expect(nav).toBeVisible();

  for (const label of [
    "Compare bases",
    "The trip",
    "Things to do",
    "Swimming",
    "Plan your trip",
  ]) {
    await expect(nav.getByText(label)).toBeVisible();
  }

  // Visit one attraction detail page and confirm it renders content.
  await page.goto("/things-to-do/grand-aquarium");
  await expect(page).toHaveURL(/\/things-to-do\/grand-aquarium/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Grand Aquarium/i }),
  ).toBeVisible();

  // Visit one stay detail page and confirm it renders its day-by-day content.
  await page.goto("/trip/saint-malo-dinan");
  await expect(page).toHaveURL(/\/trip\/saint-malo-dinan/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Saint-Malo and Dinan/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: /20 August — Mont-Saint-Michel/i }),
  ).toBeVisible();
});
