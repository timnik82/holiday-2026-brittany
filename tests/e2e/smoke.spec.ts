import { test, expect } from "@playwright/test";

test("home page shows heading and primary navigation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
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
