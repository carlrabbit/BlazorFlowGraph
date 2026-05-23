import { expect, test } from "@playwright/test";

test("home page renders the dataflow graph container", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".dataflow-graph")).toBeVisible();
});
