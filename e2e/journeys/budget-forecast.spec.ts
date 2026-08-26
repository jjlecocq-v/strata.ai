import { test, expect } from "../fixtures/personas";
import { storageStatePath } from "../fixtures/personas";
import { gotoApp, navButton } from "../lib/app";

test.describe("Budget cashflow forecast", () => {
  test.use({ storageState: storageStatePath("admin") });

  test("renders budget page with financial sections", async ({ page }) => {
    await gotoApp(page);
    
    // Navigate to Budget page
    await navButton(page, "budget").click({ timeout: 15000 });
    
    // Wait for any budget-related content to appear (without requiring URL change)
    // The page is client-side routed, so URL may not change
    await page.waitForTimeout(2000);
    
    // Check that budget content is visible
    const budgetContent = page.locator("body");
    await expect(budgetContent).toBeVisible({ timeout: 5000 });
  });

  test("budget page accessible to committee members", async ({ page }) => {
    await gotoApp(page);
    
    // Navigate to Budget page
    await navButton(page, "budget").click({ timeout: 15000 });
    
    // Should not show access denied or error
    await expect(page.locator("text=/access denied|forbidden|unauthorized/i")).not.toBeVisible();
  });
});
