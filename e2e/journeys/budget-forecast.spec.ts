import { test, expect } from "@playwright/test";
import { FIXTURE_IDS } from "../../scripts/fixture-identifiers.mjs";

test.describe("Budget cashflow forecast", () => {
  const COMMITTEE_ID = FIXTURE_IDS.committee;

  test("displays levy schedules with AGM-adopted amounts", async ({ page }) => {
    // Sign in as admin to view budget page
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', process.env.STRATA_ADMIN_EMAIL ?? "strata.fixture.admin@example.invalid");
    await page.fill('input[type="password"]', process.env.STRATA_ADMIN_PASSWORD ?? "LocalFixtureAdmin123!");
    await page.click('button[type="submit"]');
    
    await page.waitForURL("/");
    
    // Navigate to Budget page
    await page.click('a[href*="budget"]');
    await page.waitForURL(/.*budget.*/);

    // Check levy schedule section exists
    await expect(page.locator("h2#levy-schedule-heading")).toContainText("Levy schedule");

    // Verify admin fund levy appears
    await expect(page.locator("text=Admin fund contributions")).toBeVisible();
    await expect(page.locator("text=$45,583")).toBeVisible();

    // Verify capital works levy appears
    await expect(page.locator("text=Capital works fund contributions")).toBeVisible();
    await expect(page.locator("text=$37,760")).toBeVisible();

    // Verify special levy appears
    await expect(page.locator("text=Balcony/spalling repair")).toBeVisible();
    await expect(page.locator("text=$287,500")).toBeVisible();
  });

  test("displays fund balances with data quality labels", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', process.env.STRATA_ADMIN_EMAIL ?? "strata.fixture.admin@example.invalid");
    await page.fill('input[type="password"]', process.env.STRATA_ADMIN_PASSWORD ?? "LocalFixtureAdmin123!");
    await page.click('button[type="submit"]');
    
    await page.waitForURL("/");
    await page.click('a[href*="budget"]');
    await page.waitForURL(/.*budget.*/);

    // Check financial position section exists
    await expect(page.locator("h2#financial-position-heading")).toContainText("Financial position");

    // Verify fund accounts are listed
    await expect(page.locator("text=Administrative fund")).toBeVisible();
    await expect(page.locator("text=Capital works fund")).toBeVisible();

    // Check for data quality badges (missing/assumed/sourced)
    const badges = page.locator('[role="status"], .badge');
    await expect(badges).not.toHaveCount(0);
  });

  test("displays 12-month cashflow forecast", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', process.env.STRATA_ADMIN_EMAIL ?? "strata.fixture.admin@example.invalid");
    await page.fill('input[type="password"]', process.env.STRATA_ADMIN_PASSWORD ?? "LocalFixtureAdmin123!");
    await page.click('button[type="submit"]');
    
    await page.waitForURL("/");
    await page.click('a[href*="budget"]');
    await page.waitForURL(/.*budget.*/);

    // Check cashflow forecast section exists
    await expect(page.locator("h2#cashflow-forecast-heading")).toContainText("Cashflow forecast");

    // Verify forecast table headers
    await expect(page.locator("th:has-text('Month')")).toBeVisible();
    await expect(page.locator("th:has-text('Opening')")).toBeVisible();
    await expect(page.locator("th:has-text('Levy inflows')")).toBeVisible();
    await expect(page.locator("th:has-text('Known outflows')")).toBeVisible();
    await expect(page.locator("th:has-text('Projected balance')")).toBeVisible();

    // Check that at least some months are displayed
    const monthCells = page.locator("td.font-medium");
    await expect(monthCells.first()).toBeVisible();
  });

  test("shows clear labels for sourced vs missing data", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', process.env.STRATA_ADMIN_EMAIL ?? "strata.fixture.admin@example.invalid");
    await page.fill('input[type="password"]', process.env.STRATA_ADMIN_PASSWORD ?? "LocalFixtureAdmin123!");
    await page.click('button[type="submit"]');
    
    await page.waitForURL("/");
    await page.click('a[href*="budget"]');
    await page.waitForURL(/.*budget.*/);

    // Look for "missing" badge or note text on fund balances
    const missingIndicators = page.locator("text=/missing|Opening balance not in AGM minutes/i");
    await expect(missingIndicators.first()).toBeVisible();

    // Look for source references like "AGM 14 Apr 2026"
    await expect(page.locator("text=AGM 14 Apr 2026")).toBeVisible();
  });

  test("member can view budget without finance capability", async ({ page }) => {
    // Sign in as member (not admin/treasurer)
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', process.env.STRATA_MEMBER_EMAIL ?? "strata.fixture.member@example.invalid");
    await page.fill('input[type="password"]', process.env.STRATA_MEMBER_PASSWORD ?? "LocalFixtureMember123!");
    await page.click('button[type="submit"]');
    
    await page.waitForURL("/");
    await page.click('a[href*="budget"]');
    await page.waitForURL(/.*budget.*/);

    // Member should be able to read levy schedules and forecast (RLS allows read)
    await expect(page.locator("h2#levy-schedule-heading")).toContainText("Levy schedule");
    await expect(page.locator("h2#cashflow-forecast-heading")).toContainText("Cashflow forecast");
    
    // But they should not be able to edit (we're just checking they can view)
    await expect(page.locator("text=Administrative fund")).toBeVisible();
  });
});
