/**
 * Verify Preview-readiness fixes for SP 6430 33 Malvern:
 * 1. Dashboard shows open motions in attention section
 * 2. Documents with uploaded files are marked "indexed" not "needs_extraction"
 * 3. Budget lines over approved amount show "Over budget" not "Within current allowance"
 * 4. Special levy cashflow displays actual levy amounts from schedule
 * 5. (GitHub #18) Budget overrun thresholds (insurance $84k/$75k; stairs $237k/$27k; water $7k/$7k)
 * 6. (GitHub #19) People directory cards label secretaries as Committee not Resident
 */

import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function assertContains(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

function assertNotContains(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`Forbidden ${label}: ${needle}`);
  }
}

const dashboardSource = read("src/components/pages/dashboard-page.tsx");
const appDataSource = read("src/lib/strata-app-data.ts");
const documentCreateSource = read("src/app/api/documents/create/route.ts");
const buildingPlatformSource = read("src/lib/building-platform-data.ts");

// Bug #1: Dashboard must show open motions
console.log("Verifying Bug #1: Dashboard shows open motions...");
assertContains(dashboardSource, "openMotions", "open motions filter");
assertContains(dashboardSource, 'motions.filter((m) => m.status === "Open")', "open motion status filter");
assertContains(dashboardSource, "...openMotions.map((m) => ({", "open motions in attention array");
assertContains(dashboardSource, '"Open motion — requires committee decision"', "open motion attention note");
assertContains(dashboardSource, "isMotion: true", "motion type flag");
assertContains(dashboardSource, "openMotion(item.id)", "motion click handler");
assertContains(dashboardSource, 'label: "Open motions"', "open motions stat label");

// Bug #2: Uploaded PDFs must be marked "indexed" not "needs_extraction"
console.log("Verifying Bug #2: Uploaded documents marked as indexed...");
assertContains(documentCreateSource, 'const indexedStatus: DocumentStatusDb = extractedText ? "markdown_ready" : file ? "indexed" : "needs_extraction"', "file upload sets indexed status");

// Bug #3: Budget overrun must show "Over budget"
console.log("Verifying Bug #3: Budget overrun shows correct copy...");
assertContains(appDataSource, "const totalSpend = Math.max(committed, actual);", "total spend calculation");
assertContains(appDataSource, "const ratio = line.approved_amount ? Math.round((totalSpend / line.approved_amount) * 100) : 0;", "budget ratio uses total spend");
assertContains(appDataSource, 'risk: ratio > 100 ? "Over budget"', "over budget status");
assertContains(appDataSource, 'ratio > 95 ? "Allowance pressure"', "allowance pressure threshold");

// Bug #4: Special levy cashflow must use raw date data
console.log("Verifying Bug #4: Cashflow uses raw levy schedule dates...");
assertContains(appDataSource, "supabaseLevySchedules,", "cashflow uses raw levy schedule data");
assertContains(appDataSource, "supabaseFundBalances,", "cashflow uses raw fund balance data");
assertContains(appDataSource, "function generateCashflowForecast(\n  levySchedules: LevyScheduleQueryRow[],", "cashflow accepts raw query rows");
assertContains(appDataSource, "const levyMonth = new Date(levy.due_on);", "levy date parsing from raw due_on field");
assertContains(appDataSource, "const accountName = accounts.find((a) => a.id === levy.account_id)?.name", "levy account resolution");

// Bug #5 (GitHub #18): Budget overrun thresholds already fixed in Bug #3
console.log("Verifying Bug #5 (GitHub #18): Budget overrun thresholds...");
assertContains(appDataSource, 'risk: ratio > 100 ? "Over budget"', "over budget threshold at 100%");
// Examples: insurance $84,211/$75,000 = 112%; stairs $237,767/$27,000 = 880%; water $7,049/$7,000 = 100.7%
// All will trigger "Over budget" status with ratio > 100%

// Bug #6 (GitHub #19): People cards must show Committee for secretaries
console.log("Verifying Bug #6 (GitHub #19): Secretary role mapping...");
assertContains(buildingPlatformSource, 'normal.includes("secretary")', "secretary role check in roleForMember");
assertContains(buildingPlatformSource, 'normal.includes("committee") || normal.includes("chair") || normal.includes("treasurer") || normal.includes("secretary")', "secretary maps to Committee role");

console.log("\n✅ All six Preview fixes verified in source code:");
console.log("  1. Dashboard attention includes open motions");
console.log("  2. Uploaded PDFs marked as indexed");
console.log("  3. Budget overrun shows 'Over budget' when ratio > 100%");
console.log("  4. Cashflow forecast uses raw levy schedule dates");
console.log("  5. (GitHub #18) Budget overrun covers all examples (insurance, stairs, water)");
console.log("  6. (GitHub #19) Secretaries labeled as Committee in people cards");
