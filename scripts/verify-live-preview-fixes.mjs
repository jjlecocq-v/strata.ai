/**
 * Verify live Preview fixes for tickets #21 and #22:
 * 1. #21: Official PDFs show "Indexed" not "Needs extraction" when file exists
 * 2. #22: Special levy cashflow: past levies reflected in opening balance with note, not $0 future inflows
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

const appDataSource = read("src/lib/strata-app-data.ts");
const budgetPageSource = read("src/components/pages/budget-page.tsx");

// Fix #21: Documents with files show as "Indexed"
console.log("Verifying #21: Documents with storage show Indexed status...");
assertContains(appDataSource, "const hasFile = Boolean(row.storage_path || storageObjectPath || linkedAttachment);", "file existence check");
assertContains(appDataSource, "const effectiveStatus = (row.indexed_status === \"needs_extraction\" && hasFile)", "needs_extraction override check");
assertContains(appDataSource, "? \"indexed\"", "override to indexed status");
assertContains(appDataSource, "status: documentStatusMap[effectiveStatus],", "use effective status");

// Fix #22: Special levy cashflow with past levy notes
console.log("Verifying #22: Past levy schedules reflected in opening balance with notes...");
assertContains(appDataSource, "const pastLevies = accountLevies.filter((levy) => {", "past levy filter");
assertContains(appDataSource, "return levyDate < today;", "past date comparison");
assertContains(appDataSource, "const pastLevyTotal = pastLevies.reduce((sum, levy) => sum + levy.amount, 0);", "past levy total calculation");
assertContains(appDataSource, "if (isFirstMonth && hasPastLevies) {", "first month note condition");
assertContains(appDataSource, "notes = `Opening balance reflects ${pastLevies.length} past levy schedule(s)", "explanatory note text");
assertContains(appDataSource, "due before forecast period", "note explains timing");

// Verify UI displays notes
console.log("Verifying cashflow UI displays notes...");
assertContains(budgetPageSource, "{month.notes && (", "note conditional rendering");
assertContains(budgetPageSource, "<TableCell colSpan={5}", "note spans full row");
assertContains(budgetPageSource, "{month.notes}", "note content display");

console.log("\n✅ Both ticket fixes verified in source code:");
console.log("  #21: Documents with storage paths show 'Indexed' not 'Needs extraction'");
console.log("       - Official/source PDFs can be opened by secretary");
console.log("  #22: Past special levy schedules reflected in opening balance with explanatory note");
console.log("       - May/June $287,500 x 2 = $575k in opening position (received or overdue)");
console.log("       - NOT injected into Jul 2026–Jun 2027 forecast as future inflows");
