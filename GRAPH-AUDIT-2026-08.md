# strata.ai production-readiness audit — August 2026

Audit date: 2026-08-23 (Australia/Sydney)

Authoritative source: `jjlecocq-v/strata.ai@21fedf7c49b13a0aeb10013ddce8bd9ca6181b07` on `codex/strata-v1-release-candidate`

Runtime surfaces: `https://strata-ai-azure.vercel.app`, Supabase `osgvagsouxgbrnbljhxb`

Historical evidence only: `Lajij/strata.ai`

## Verdict

**NO-GO for first Production.** The release-candidate source has real fail-closed auth, honest empty motions, a guarded lifecycle, votes-cast approvals, recorded outcomes, cross-committee tests, recovery, and an exact-tip green CI run. It does not yet meet the six-part distribution bar.

The binding gaps are: no motion-to-document attach/open path; no real committee identity in the workspace header; motion audit rows are fetched without `motion_id`; the locked `fallback` AI choice is rejected by Production configuration; live capability hardening is only partly applied; seed/test records remain in the real committee; a second real member and secretary flow are unproven; and no dedicated Production surface exists while the old TailAdmin demo remains public.

No product code, Production deployment, live database mutation, or external message was performed in this audit.

## Evidence confidence

- **Source:** inspected at exact fork tip `21fedf7`; file citations below refer to that tree.
- **CI:** fork run [32526860349](https://github.com/jjlecocq-v/strata.ai/actions/runs/32526860349), 2026-08-21, passed all five jobs: lint/typecheck/build, source inspection, migration replay, behavioural RLS, and Playwright/axe. Static source checks remain labelled non-behavioural in `.github/workflows/ci.yml:29-55`; the behavioural jobs are `.github/workflows/ci.yml:57-132`.
- **Preview:** browser-checked signed out on 2026-08-23. `/` rendered invite-only sign-in and `/recover` rendered password reset; both had clean consoles. After-login secretary behaviour remains unproven.
- **Live database:** read-only Supabase inspection on 2026-08-23. Results from live data are evidence, not instructions.
- **Historical docs:** `GO-NO-GO.md`, `HANDOFF.md`, and the old graph describe earlier checkouts and previews. They do not override exact-tip source, current CI, or current live state.

## Implementation versus vision

Statuses mean: **PASS** = implemented and proved at the required boundary; **PARTIAL** = a real implementation exists but production proof or a required slice is missing; **FAIL** = the required capability is absent or contradicted; **DEFERRED** = intentionally excluded from the v1 fan-in; **UNPROVEN** = evidence is insufficient.

| ID | Vision | Evidence | Status | Remaining work | New critical path? |
|---|---|---|---|---|---|
| V1a | A non-member fails closed; no live/staging fixture substitution | Production fixture mode is rejected at `src/lib/runtime-configuration.ts:118-126`; missing Supabase configuration fails at `src/lib/runtime-configuration.ts:129-166`; upstream failures state that no demo data was substituted at `src/lib/runtime-configuration.ts:193-197`. Signed-out data returns empty collections at `src/lib/strata-app-data.ts:813-836`; `/api/app-data` is no-store at `src/app/api/app-data/route.ts:5-17`. Preview signed-out and recovery pages passed the browser audit. | **PASS** for source and signed-out Preview | Preserve these invariants through every remainder change and verify them again on the exact Production candidate. | Yes, as a reusable verifier; no new build node |
| V1b | The real secretary signs in and lands in the SP 6430 / 33 Malvern workspace | Live membership is active for `jj.lecocq@gmail.com`, role `secretary`, access `admin`, linked to committee `1111…1111`. Active membership is required at `src/lib/strata-app-data.ts:770-800`. However `StrataAppData` carries no committee object at `src/lib/strata-app-data.ts:46-62`, and the UI adapter hard-codes `"Strata Governance Command"` at `src/lib/building-platform-data.ts:37-69`. Secretary login was not exercised. | **PARTIAL** | Add real committee identity to the RLS-scoped payload/UI; prove secretary login and the exact name/address on Preview and Production. | **Yes** |
| V2 | An empty committee sees an honest empty motions list | Signed-out collections are empty at `src/lib/strata-app-data.ts:815-836`; live motion mapping returns `[]` when the query is empty at `src/lib/strata-app-data.ts:985-998`; the UI says “No motions yet” at `src/components/pages/motions-page.tsx:47-62`. Live committee motion count was `0`. | **PASS** in source and live data; after-login UI still part of final rehearsal | Keep this assertion in exact-candidate tests; do not seed a motion to make the screen look populated. | Yes, verification only |
| V3a | Create, open, decide/withdraw; terminal motions are immutable | Workflow create/advance/update is implemented at `src/app/api/workflow/[action]/route.ts:238-389`. The trigger permits only draft→open→decided/withdrawn and locks terminal rows at `supabase/migrations/20260819120001_motions_lifecycle.sql:31-83`; RLS and grants are at `:85-108`. The Playwright journey covers legal transitions, read-only denial, terminal rejection, and cross-committee denial at `e2e/journeys/motion-lifecycle.spec.ts:18-102`. Live has both motion triggers. | **PASS** in source, CI, and live schema; **UNPROVEN** with real people | Exercise it as the secretary on the exact candidate; preserve the existing behavioural gates. | Yes, final rehearsal |
| V3b | A second member approves; outcome is simple majority of votes cast; 0–0 is failed; isolation holds | Approval schema and RLS are at `supabase/migrations/20260820120001_committee_approvals.sql:7-38` and `:99-153`. The outcome trigger explicitly sets passed iff approvals > rejections and makes 0–0 failed at `:40-97`. Workflow routes are at `src/app/api/workflow/[action]/route.ts:392-541`. Playwright proves two approvals, one rejection, and cross-committee isolation at `e2e/journeys/approval-flow.spec.ts:22-157`; the portable RLS verifier explicitly asserts 0–0 failed at `scripts/verify-capability-rls.mjs:468-474`. | **PARTIAL** | Add/activate a second real member and run the full two-person flow. Add an HTTP/UI 0–0 assertion so the database-only check is not the sole proof of that rule. | **Yes** |
| V3c | Motion audit history is visible and attributable | Routes write `motion_id` into audit rows, e.g. `src/app/api/workflow/[action]/route.ts:314-320`, and the drawer advertises persisted history at `src/components/motions/motion-detail-drawer.tsx:257-275`. `mapAudit` reads `row.motion_id` at `src/lib/strata-app-data.ts:742-766`, but the live query omits that column at `src/lib/strata-app-data.ts:880-884`; therefore every mapped event has no motion link. | **FAIL** | Select `motion_id`, add a behavioural assertion that the created/opened/decided events appear on the correct motion, and retain tenant isolation. | **Yes** |
| V4 | Attach a real document to a motion and open it | Motion creation posts only title/context at `src/components/motions/create-motion-dialog.tsx:44-53`, and the drawer contains context, approval, lifecycle, and audit only at `src/components/motions/motion-detail-drawer.tsx:112-275`. The document route accepts only optional `cardId` and `projectId` at `src/app/api/documents/create/route.ts:118-131`, and inserts an attachment without a motion link at `:202-213`. The base attachment table has `card_id` and `document_id`, not `motion_id`, at `supabase/migrations/202606250001_initial_strata_governance.sql:95-108`. The Documents page uploads and shows metadata but has no open/download action at `src/components/pages/documents-page.tsx:61-160`. | **FAIL** | Execute fork issue #1: additive relation, RLS, upload/attach UI, scoped signed/open path, and end-to-end/open-file proof including cross-tenant denial. | **Yes** |
| V5 | Invite or add a second real committee member | People UI calls the real invite API at `src/components/pages/people-page.tsx:41-83`. The route independently authorizes admin/chair/secretary, uses the current origin for the callback, sends a Supabase invite, and upserts `status=invited` at `src/app/api/members/invite/route.ts:56-67` and `:70-147`. The sign-in surface activates an invite at `src/components/strata-app.tsx:57-78`. Live has only JJ plus seed/test identities; none is accepted as the required second real committee member. | **PARTIAL** | Name the real member, send one invite from the approved candidate/origin, have that person accept, then prove active membership and an attributed approval. | **Yes**; human acceptance gate |
| V6a | Dedicated Production URL with correct auth redirects | The audited URL is a public Preview, not a dedicated Production release. The target Vercel project belongs to `jjlecocq-8187s-projects`; the current Vercel connector session cannot inspect it (403/scope mismatch). The invite callback is origin-derived at `src/app/api/members/invite/route.ts:81-102`; recovery likewise depends on allowed callback configuration. | **FAIL / UNPROVEN** | Reconnect the target Vercel scope; configure the dedicated Production hostname, exact Production env, Supabase Site URL/redirect allowlist, and rollback target; verify before any promotion. | **Yes** |
| V6b | Locked AI fallback works safely on Production | The decision is `STRATA_AI_RELEASE_MODE=fallback`. The route builds RLS-filtered Supabase context before fallback at `src/app/api/ai/[task]/route.ts:397-464`, but configuration rejects fallback whenever Vercel reports Production at `src/lib/runtime-configuration.ts:169-190`. README still requires live AI for Production at `README.md:172-181`. | **FAIL** | Reconcile code, copy, and tests with the locked fallback decision. Production fallback may use only active-member RLS context, must never load app fixtures, and must be visibly labelled bounded/non-binding. | **Yes** |
| V6c | No old public TailAdmin demo | Browser audit of `https://strata-ai.vercel.app/` on 2026-08-23 still showed the unrelated public TailAdmin navigation/profile demo. | **FAIL** | After the new Production URL is healthy, redirect or remove the old public deployment and verify it no longer serves TailAdmin. | **Yes**, after Production health |
| SEC1 | Repository capability/attribution migration is present on live | Repository migration defines locked-search-path document/incident access helpers at `supabase/migrations/202608160001_capability_and_attribution_hardening.sql:82-170`, audit/financial enforcement triggers at `:172-221`, and the policy rewrite from `:223` onward. Live migration history has no `202608160001`; `can_access_document`, `can_access_incident`, and both enforcement functions are absent; `can_access_card` is not locked to an empty search path; four sampled old policy names remain. Motion/approval migrations are present. | **FAIL / PARTIAL LIVE APPLY** | Rehearse the exact migration on an isolated database, apply non-destructively to the attested live project, record migration history, and independently diff helpers, triggers, grants, and policies. | **Yes** |
| DATA1 | The real workspace contains real committee data, not release fixtures | Live committee identity is correct and motions are empty. Live cards are `Live fire door approval`, `Admin levy hardship matter`, and `Custom access legal review`; members include two `auth-browser-*` users plus `strata.admin@example.com` and `strata.member@example.com`. The intentionally skipped broad reconcile migration is unsafe because it can remove the real committee. | **FAIL** | Back up and classify exact IDs; use a targeted, reviewable cleanup/quarantine with no reset and no broad committee predicate; prove JJ still exists and no seed title/test member remains visible. | **Yes**; targeted-live-mutation gate |
| AUTH1 | Production-grade password/auth posture | Auth UI and recovery exist. The live Supabase security advisor reports leaked-password protection disabled; the vector extension also resides in `public`. | **PARTIAL** | Enable leaked-password protection if supported; capture the redirect allowlist with the Production URL. Treat vector relocation as post-v1 database hygiene unless it blocks a reviewed migration. | Password protection/redirects: **Yes**; vector warning: No |
| B | Email ingest / reviewed register | Schema has `email_sources` at `supabase/migrations/202606250001_initial_strata_governance.sql:298-309`; there is no shipping Gmail ingestion workflow proved by source or CI. Decisions #1–#2 remain unanswered. | **DEFERRED** | Keep mailbox access prohibited. Re-enter only after Gmail scope and retention/confidentiality decisions are recorded. | **No**; router excludes |
| D | Eve drafts | Eve package/scripts are wired in `package.json:10`, `:49-50`; scoped tools/evals exist under `agent/` and `evals/`, and exact-tip CI passed both source gates. They are not required for the six-part first-production bar; the Production fallback conflict must be fixed independently. | **DEFERRED (implemented, not release fan-in)** | Do not expand or exercise draft writes for v1. Preserve tests; revisit after an explicit scope decision. | **No**; router excludes |
| E | Finance / project controls | Current Projects/Budget read surfaces and finance route exist, but the addendum’s expanded ledgers/scenarios/import confirmation model is not the first-production bar. Decision #8 is `defer-track-e-post-v1`; decision #10 is pending. | **DEFERRED** | Do not fan finance into rehearsal. Re-enter only after named confirm-figure authority and a separate contract review. | **No**; router excludes |
| M | Meetings/minutes | The enum admits a `meeting` card type at `supabase/migrations/202606250001_initial_strata_governance.sql:10`; no dedicated meeting/minutes workflow is part of the verified product. Decision #7 is No. | **DEFERRED** | Do not build or claim it in v1. | **No**; router excludes |
| N38 | Inbox notifications (#38) | No dedicated notification/inbox data model, route, or UI is part of the source surfaces; settings explicitly remain read-only at `src/components/app-shell.tsx:71-74`. Historical Lajij #38 is still not fork work. | **DEFERRED** | Create a fork issue only when notifications are brought back into scope; do not inherit the historical ticket as authority. | **No**; router excludes |

## Historical graph node rescore

Every node in the superseded `GRAPH-PLAN.md`/`GRAPH-STATE.md` was reclassified against the fork tip and current live boundary. “Done-source” does not mean “proved on the real committee.”

| Historical node | 2026-08 disposition | Rationale / successor |
|---|---|---|
| `decide-gates` | **Superseded** | Locked answers live in `scope-router`; #1–#2/#9–#10 attach only to excluded tracks. |
| `consolidate` | **Done-baseline** | Present before/at fork SHA `21fedf7`; no remainder output. |
| `local-gate` | **Done-baseline, reusable gate** | Exact-tip fork CI supersedes the earlier local nine-gate claim; rerun at source fan-in. |
| `dependency-hardening` | **Done-baseline** | Exact-tip lint/typecheck/build CI is green; no current dependency finding was opened by this audit. |
| `release-decisions` | **Done-router, implementation conflict found** | Decisions remain locked; `production-fallback` now closes the code/README contradiction. |
| `release-revision` | **Obsolete artifact** | Historical `be4c4d0` is superseded by fork RC `21fedf7`; `baseline-rc` owns traceability. |
| `release-preview` | **Stale proof** | Earlier 8964-team deployment is not the audited 8187-team Preview or a Production candidate. Successor: `candidate-preview`. |
| `production-go-no-go` | **Replaced / blocked** | Successor `production-unlock` consumes the new real-committee rehearsal, not the old GO-NO-GO report. |
| `preview-1` | **Stale proof** | Current public Preview signed-out surface was rechecked; exact-candidate after-login proof remains. |
| `auth-harden` | **Partial live** | Member lifecycle exists, but full capability/attribution migration is incomplete live. Successor: `live-capability-reconcile`. |
| `recovery-flow` | **Done-source / Production-unproven** | `/recover` exists and signed-out Preview renders; Production redirect proof moves to `production-auth-config`. |
| `role-gate` | **Done-CI / reusable** | Persona E2E passes on local Supabase; rerun for candidate and use non-mutating Production lenses. |
| `fe-freeze` | **Done historical input** | Current source and this audit are authoritative; no new freeze node. |
| `fe-inventory` | **Superseded** | `FRONTEND-GAPS.md` contains historical closed gaps and stale line numbers. `GRAPH-AUDIT-2026-08.md` is the current gap inventory. |
| `fe-journey:login` | **Done-source / real-secretary-unproven** | Fail-closed login ships; successor proof is `secretary-preview-rehearsal`. |
| `fe-journey:dashboard` | **Done-source with identity/data remainder** | Current UI exists; generic committee identity and live fixture data move to dedicated nodes. |
| `fe-journey:projects` | **Done-source / excluded from release bar** | Surface remains available but finance/Track E does not gate v1. |
| `fe-journey:decisions` | **Done-source with audit remainder** | Card workflow exists; missing motion audit read is now `motion-audit-read`. |
| `fe-journey:documents` | **Partial** | General upload exists; motion attach/open did not. Successor: `motion-attach-open` (#1). |
| `fe-journey:admin` | **Done-source / real-member-unproven** | Invite/member UI/API exist; successor: `second-real-member`. |
| `fe-qa` | **Done-CI / candidate-human-unproven** | Playwright/axe passes exact tip; successor: the fresh-eyes portion of `secretary-preview-rehearsal`. |
| `intake:{thread}` | **Deferred** | Decisions #1–#2 pending; no mailbox. |
| `review-queue` | **Deferred** | Consumes Track B only; no v1 edge. |
| `register` | **Deferred** | Consumes reviewed intake only; no v1 edge. |
| `dash` | **Done-source** | No remainder node; preserve through full CI. |
| `drilldown` | **Done-source** | No remainder node; preserve through full CI. |
| `search` | **Done-source** | No remainder node; preserve through full CI. |
| `meeting-mode` | **Deferred** | Decision #7 excludes it. |
| `eve-tools` | **Implemented / deferred** | Preserve source gate; no v1 fan-in. |
| `eve-evals` | **Implemented / deferred** | Exact-tip source/eval CI passes; no v1 fan-in. |
| `eve-drafts` | **Implemented / deferred** | No draft execution or release claim for v1. |
| `e-contracts` | **Deferred** | Decision #8; no v1 edge. |
| `e-confirmation-model` | **Deferred** | Decision #10 pending; no v1 edge. |
| `e-storage-policy` | **Deferred** | Decision #9 pending; no v1 edge. |
| `e-migration` | **Deferred** | Track E excluded; no live apply. |
| `e-types` | **Deferred** | Track E excluded. |
| `e-views` | **Deferred** | Track E excluded. |
| `e-routes` | **Deferred** | Track E excluded. |
| `e-seed` | **Deferred** | Track E excluded; never seed Production. |
| `e-extractor-build` | **Deferred** | Track E/Track B excluded. |
| `e-extractor-run` | **Deferred** | Track E/Track B excluded. |
| `e-verify` | **Deferred, predecessor patterns retained** | Existing legacy budget checks do not prove addendum contracts; write new coverage only when Track E re-enters scope. |
| `e-v0` | **Deferred** | Track E excluded. |
| `e-wire` | **Deferred** | Track E excluded. |
| `preview-n` | **Stale proof** | Historical deployment is not the new exact candidate. Successor: `candidate-preview`. |
| `rehearsal` | **Stale / replaced** | Historical fixture/read-only rehearsal did not exercise JJ, a second real member, motion document open, or dedicated Production. |
| `go-no-go` | **Replaced** | Successor chain is `secretary-preview-rehearsal → production-unlock → production-release`. |

## Live-state snapshot

Read-only inspection on 2026-08-23 returned:

- Committee `11111111-1111-1111-1111-111111111111`: **SP 6430 - 33 Malvern Avenue**, 33 Malvern Avenue, Manly NSW 2095.
- `jj.lecocq@gmail.com`: active secretary, `access_level=admin`, linked Auth user.
- Motions: `0`.
- Test/seed members: two `auth-browser-*-managed@example.com` identities, `strata.admin@example.com`, and `strata.member@example.com`.
- Fixture-looking cards: the three titles listed in `DATA1`.
- Present capability helpers: `current_member_id`, `is_committee_member`, `has_capability`, `can_access_card`.
- Missing expected helpers/triggers: `can_access_document`, `can_access_incident`, `enforce_audit_identity`, `enforce_invoice_confirmation_capability`.
- Present motion triggers: `motions_guard`, `guard_motion_outcome`.
- Migration ledger ends with `20260821224249 motions_lifecycle` and `20260821224303 committee_approvals`; no capability-hardening ledger entry.

## Coverage audit

| Claim | Existing verifier | What it really proves | Gap |
|---|---|---|---|
| Fail closed / fixtures | `verify:fail-closed`; Playwright personas | Runtime negative paths and isolated local/CI browser behaviour | Exact Production candidate and secretary session still needed |
| Capability RLS | `verify:capabilities:rls` | Portable ephemeral Postgres personas; CI passes | It does not prove the live migration/policy state |
| Motion lifecycle | `e2e/journeys/motion-lifecycle.spec.ts` | Real HTTP/Data API on CI’s local Supabase | No real-member live click proof |
| Approval outcome | `e2e/journeys/approval-flow.spec.ts`; `verify:capabilities:rls` | Passed/failed votes-cast flows; 0–0 at database level | Add UI/HTTP 0–0 and real two-member proof |
| Documents | existing document verifier and UI source gate | Upload/storage and current Documents page contract | No motion relation and no open-file journey; predecessor tests are not coverage |
| Recovery | recovery source/browser scripts | Isolated callback and password change | Production hostname must be on the live allowlist |
| Eve | `verify:eve-tools`, `verify:eve-evals` | Source/eval fixture boundary | Correctly deferred; not a substitute for Production AI fallback proof |

## Audit disposition

The stale graph’s broad Wave 1–3 claims are replaced by the remainder graph in `GRAPH-PLAN.md`. Closed historical issues prove provenance, not current live acceptance. The exact-tip CI run is strong baseline evidence, but its local Supabase reset and seeded personas (`.github/workflows/ci.yml:103-132`) cannot certify the live project or a real committee login.
