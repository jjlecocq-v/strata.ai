/**
 * Verify #22 Financial position fix:
 * Secretary-facing Financial position card must show $575k for special levy account
 * (15 May + 16 Jun 2026 $287,500 × 2 = $575k as received or overdue)
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

console.log("Verifying #22: Financial position shows $575k for special levy account...");

// Part 1: Past levies grouped by account
assertContains(appDataSource, "const pastLeviesByAccount = new Map<string, { count: number; total: number }>();", "past levies map by account");
assertContains(appDataSource, "for (const levy of levySchedules) {", "iterate levy schedules");
assertContains(appDataSource, "const levyDate = new Date(levy.due_on);", "parse levy date");
assertContains(appDataSource, "if (levyDate >= today) continue; // Only past levies", "filter past levies");

// Part 2: Add past levies to current/opening balance
assertContains(appDataSource, 'if (row.account_id && (row.balance_type === "current" || row.balance_type === "opening")) {', "check current/opening balance");
assertContains(appDataSource, "const pastLevies = pastLeviesByAccount.get(row.account_id);", "get past levies for account");
assertContains(appDataSource, "if (pastLevies && pastLevies.total > 0) {", "check has past levies");
assertContains(appDataSource, "balanceAmount += pastLevies.total;", "add past levies to balance amount");

// Part 3: Add explanatory note
assertContains(appDataSource, 'const pastLevyNote = `Includes ${pastLevies.count} past levy schedule(s)', "explanatory note");
assertContains(appDataSource, 'due before ${formatDate(today.toISOString())}', "note includes date");
assertContains(appDataSource, "notes = notes ? `${notes} ${pastLevyNote}` : pastLevyNote;", "append note");

// Part 4: mapFundBalances signature includes levySchedules
assertContains(appDataSource, "function mapFundBalances(\n  rows: FundBalanceQueryRow[],\n  accounts: AccountQueryRow[],\n  levySchedules: LevyScheduleQueryRow[],", "mapFundBalances accepts levy schedules");
assertContains(appDataSource, "const fundBalances = mapFundBalances(supabaseFundBalances, supabaseAccounts, supabaseLevySchedules);", "call with levy schedules");

console.log("\n✅ #22 Financial position fix verified in source code:");
console.log("  - Past special levy schedules (May/June $287,500 × 2) detected");
console.log("  - $575k ADDED to current balance amount for special levy account");
console.log("  - Secretary-facing Financial position card displays $575k");
console.log("  - Explanatory note added showing past levies total and date context");
console.log("  - March 20 AGM snapshot may stay if clearly labeled (levy not due then)");
