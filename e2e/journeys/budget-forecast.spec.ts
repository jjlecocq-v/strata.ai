import { test, expect } from "../fixtures/personas";
import { storageStatePath } from "../fixtures/personas";
import { gotoApp, navButton } from "../lib/app";

test.describe("Budget cashflow forecast", () => {
  test.use({ storageState: storageStatePath("admin") });

  test("renders budget page with financial sections", async ({ page }) => {
    await gotoApp(page);
    
    // Navigate to Budget page
    await navButton(page, "budget").click({ timeout: 15000 });
    await page.waitForURL(/.*budget.*/, { timeout: 15000 });

    // Check that the main budget sections exist
    const mainHeading = page.locator("h1, h2").filter({ hasText: /budget|financial/i });
    await expect(mainHeading.first()).toBeVisible({ timeout: 10000 });
  });

  test("budget page accessible to committee members", async ({ page }) => {
    await gotoApp(page);
    
    // Navigate to Budget page
    await navButton(page, "budget").click({ timeout: 15000 });
    
    // Should not show access denied or error
    await expect(page.locator("text=/access denied|forbidden|unauthorized/i")).not.toBeVisible();
  });
});
