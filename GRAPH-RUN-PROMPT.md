# strata.ai — autonomous first-Production remainder loop

Paste the block below into a fresh capable agent session rooted in the authoritative `jjlecocq-v/strata.ai` checkout. It executes the new remainder graph; it must not execute or revive the historical phase loop.

```text
> GRAPH EXECUTION LOOP — strata.ai first Production remainder

ROLE
You are the executor for the strata.ai first-Production remainder. Continue autonomously
until FINAL or WAITING. Do not ask for routine permission, restate the plan, or reopen
locked product decisions. Ask only when a named human gate is the sole remaining input.

AUTHORITATIVE SURFACES
- Repository: jjlecocq-v/strata.ai
- Base branch: codex/strata-v1-release-candidate
- Audited base SHA: 21fedf7c49b13a0aeb10013ddce8bd9ca6181b07
- Preview: https://strata-ai-azure.vercel.app (never treat a Preview share as Production)
- Supabase: osgvagsouxgbrnbljhxb, committee
  11111111-1111-1111-1111-111111111111 = SP 6430 / 33 Malvern
- Historical Lajij/strata.ai is read-only evidence. Never create its issues or PRs.

AUTHORITATIVE FILES — READ FIRST
1. AGENTS.md and any applicable nested instructions. Before writing Next.js code, read
   the relevant guide under node_modules/next/dist/docs/ as AGENTS.md requires.
2. GRAPH-AUDIT-2026-08.md — evidence and implementation-vs-vision status.
3. GRAPH-PLAN.md — node ids, edges, contracts, verifiers, cycles, critical path.
4. GRAPH-STATE.md — resumable state; trust evidence pointers, never session memory.
5. DECISIONS-REQUIRED.md — locked routers and deferred human decisions.

Do not run the old GRAPH-RUN-PROMPT history from git. This block is the only execution
loop. If the RC tip moved after 21fedf7, audit only the delta, update baseline-rc, and
continue; do not restart completed work without evidence that it regressed.

STATE CONTRACT
Maintain GRAPH-STATE.md after every DECIDE step. Exactly one line per graph node:
  <node-id> | pending / in-progress / blocked(<exact owner/input>) / done | <evidence>
Also maintain routers, delivery state, hard stops, and normalized seen-gate fingerprints.
A node is done only when its output contract and its distinct verifier are both evidenced.
Maker and verifier may share one GitHub issue but may not be the same grading pass.

LOCKED ROUTERS — DO NOT REOPEN
- Frontend = replace. Canonical language is cards/votes/updates/people.
- AI = verified fallback (STRATA_AI_RELEASE_MODE=fallback). Live Gateway is later opt-in.
- Meetings/intake = No. Track B and meeting mode are excluded from v1.
- Track D Eve drafts = excluded from the six-part first-Production fan-in.
- Track E finance = defer-track-e-post-v1.
- Notifications #38 = excluded from v1.
- Approval outcome = simple majority of votes cast. Eligible count is never the
  denominator; 0–0 decide records failed.
- Live/staging = fail closed. Empty or 503, never demo/fixture substitution.
- Decisions #1 Gmail, #2 retention, #9 photos, and #10 named financial confirmer remain
  human and gate deferred tracks only. Do not wait on them for v1.

RUNNER ROUTER
If GitHub/Foreman is healthy, use it. If not, execute locally or as a later human/agent.
Runner health never changes product edges. Use isolated git worktrees for parallel source
nodes whose UI/schema edits may collide. Do not touch unrelated dirty work in another
checkout. New issues, branches, pushes, and PRs belong only to jjlecocq-v/strata.ai.

WAVE 0 — RESUME AND SYNC
1. Read GRAPH-STATE.md; select only pending/unblocked nodes whose inputs are done.
2. Confirm current source is the fork RC or a descendant. Record exact SHA.
3. Sync the narrow fork issue for each remainder concern listed in GRAPH-PLAN.md. Update
   existing #1; do not duplicate it. One concern per issue; include output contract,
   verifier, hard stops, and not-in-scope. If GitHub auth is unavailable, mark only
   issue-sync blocked and continue source/live work that does not require it.
4. Preserve the exact-tip CI baseline. Do not relabel old local/stale checks as current.

WAVE 1A — FOUR PARALLEL SOURCE CONCERNS
Start every unblocked arm concurrently in isolated worktrees. Each maker opens/uses its
one concern issue, implements only that contract, and hands a commit to a distinct
verifier.

A. committee-identity → verify-committee-identity
   Carry the authenticated member's RLS-scoped committee name/address into app data and
   the shell. Remove the generic Strata Governance Command label from live sessions.
   Verify Committee A, Committee B, outsider, and signed-out perspectives.

B. motion-audit-read → verify-motion-audit-read
   Fetch/map motion_id and prove create/open/approval/decide events render only on the
   correct motion and never cross tenant. A source grep cannot pass this gate.

C. motion-attach-open → verify-motion-attach-open (existing fork issue #1)
   Add the smallest v1 motion↔document relation, scoped upload/attach UI, motion drawer
   list, and time-limited open path. Verify exact bytes, reload persistence, hidden and
   cross-tenant denial, and expiry. Do not expand into trusted-records/N4 or extraction.

D. production-fallback → verify-production-fallback
   Reconcile explicit fallback with Production configuration. It may use only the active
   member's RLS-filtered Supabase context, must be visibly bounded/non-binding, must not
   load app fixtures or call Gateway, and must leave live mode opt-in/fail-closed. Align
   README and production-like tests with the locked decision.

For every source concern: read relevant Next.js docs first, add behavioural coverage,
run its focused gate, then lint/typecheck/build as proportional. Never weaken a test or
policy to make it green.

WAVE 1B — FOUR PARALLEL LIVE/OPERATIONS CONCERNS
Run independently of source construction; live runtime data must not feed build-time code.

E. live-capability-reconcile → verify-live-capabilities
   Rehearse repository migration 202608160001 on isolated Postgres/Supabase. Compare the
   live catalog. Apply only the reviewed non-destructive migration to the attested project,
   with backup/recovery evidence and no reset. Independently verify ledger, locked search
   paths, helpers, triggers, grants, replaced policies, and persona denial. Mutating persona
   tests run on isolated local/staging; Production receives non-mutating sentinels.

F. live-data-sanitize → verify-live-data
   First produce a backup and exact-ID manifest for the known test members/Auth identities
   and fixture-looking cards. WAIT for the operator's targeted-cleanup unlock. Then alter
   only approved IDs. Never run the broad legacy fixture reconciliation, reset the project,
   or use a committee-wide delete. Verify JJ, committee, storage, law corpus, and honest
   empty motions remain, with only approved rows changed.

G. production-auth-config → verify-production-auth
   After the correct Vercel target and Production hostname are available, configure/read
   back exact Supabase Site URL and redirect allowlist for sign-in, invites, and /recover;
   enable leaked-password protection if the project plan supports it. No wildcard and no
   secret output. Use the generated recovery-link verifier on non-Production; Production
   checks are non-mutating.

H. second-real-member → verify-second-real-member
   WAIT for a named real member and recipient availability. Send one invite from the stable
   approved origin; never auto-resend. Recipient accepts and signs in. A fresh verifier
   proves two distinct Auth/member IDs, SP 6430-only visibility, and an approval attributed
   to the second member. Seed/test identities do not count.

WAVE 2 — EXACT CANDIDATE AND HARD FAN-IN
1. When all four source verifiers pass, mechanically merge only those commits. Run the
   entire fork CI matrix: lint, typecheck, build, source gates, migration replay,
   behavioural RLS, Playwright/axe. Any source change creates a new candidate SHA.
2. candidate-preview: deploy Preview only. Record exact SHA, deployment ID, Preview URL,
   target=preview, runtime attestation, and Production before/after listing. Never use
   --prod, promote, alias, rollback, or an equivalent Production action.
3. Wait only for the four live/ops verifiers. Then secretary-preview-rehearsal uses the
   exact candidate with a user-controlled JJ session and the real second-member session:
   - signed-out lock and /recover;
   - exact SP 6430 / 33 Malvern identity;
   - honest empty motions before creation;
   - create motion, attach real file, reload and open exact file;
   - open and decide a no-vote probe; outcome failed;
   - two-person approve/reject attribution and passed/failed outcomes;
   - terminal lock and cross-committee/nonmember denial;
   - clean console, responsive layout, keyboard/a11y pass;
   - record IDs, screenshots, SHA/deployment/runtime attestation, and cleanup disposition.
4. If rehearsal changes code/config/data outside its approved contract, invalidate the
   candidate and return only the affected node to pending.

WAVE 3 — OPERATOR-GATED PRODUCTION TAIL
Prepare a GO packet containing the exact candidate SHA/deployment, every verifier pointer,
dedicated hostname, Production env/auth manifest, rollback target/procedure, and residual
risks. Then:
- Without exact `GO <sha> <deployment-id> <hostname>` from the operator: print WAITING.
- With exact GO: production-release may configure/deploy that immutable candidate to the
  dedicated Production URL. No other SHA may be substituted.
- A distinct verifier runs non-destructive production-smoke: signed-out lock/recover,
  runtime attestation, exact committee identity, read existing accepted motion/document/
  approval evidence, second-member visibility, outsider denial, and clean console.
- Only after smoke passes: retire-tailadmin redirects/removes the old public
  strata-ai.vercel.app TailAdmin demo. verify-public-surface checks both domains, no
  redirect loop, and recovery reachability.
- release-record reduces all evidence into GRAPH-STATE.md and closes only verified issues.

VERIFIER RULE
The maker never grades itself. A node needs command-level or live evidence matching its
GRAPH-PLAN.md output contract. Static source inspection may support but never substitute
for behavioural claims. Existing document upload, RLS, Eve, or fallback scripts are
predecessor patterns unless they exercise the exact new boundary. Do not mark live state
from a local Supabase reset, or Production from a Preview.

HARD STOPS
- No `vercel --prod`, promote, Production deployment, rollback, alias mutation, or
  equivalent until the exact operator GO later unlocks production-release.
- No destructive live database reset, broad fixture reconciliation, committee-wide
  delete, or unreviewed live migration.
- No mailbox read until decisions #1–#2; Track B remains excluded unless re-scoped.
- No external email/message and no automatic invite retry. One named-member invite only
  after the member/recipient gate.
- Never print, commit, log, or expose a secret. Never put any server/service key in a
  NEXT_PUBLIC_* variable or browser bundle.
- Two consecutive failures of the same gate stop that track. Record issue, SHA, gate,
  normalized failure fingerprint, attempts, and exact owner/input; continue other tracks.
- Never weaken a gate, RLS policy, isolation assertion, or fail-closed boundary to pass.

LOOP PROTOCOL — REPEAT EVERY TURN
1. PLAN
   Read state. Pick the weakest unproven, unblocked in-scope node whose real inputs are
   done. Prefer critical-path nodes, but start independent arms rather than waiting.
   State node id, consumed inputs, output contract, verifier, and stop condition.

2. DO
   Execute only that bounded contract at its assigned tier. Keep source concerns isolated.
   Take reversible/read-only steps first on external systems. Capture evidence pointers
   without secrets. Update the narrow fork issue when GitHub is available.

3. VERIFY
   Use a distinct pass/persona. Record command, environment boundary, SHA/deployment/data
   IDs, result, and failure fingerprint. Score the ten release criteria 1–10:
   (1) fail-closed auth, (2) real committee identity, (3) honest empty motions,
   (4) lifecycle/audit/outcomes/isolation, (5) motion attach+open,
   (6) second real member, (7) live RLS/data hygiene, (8) exact Preview rehearsal,
   (9) dedicated Production/auth/rollback, (10) old public demo retired.

4. DECIDE
   - If a node passes, mark maker and verifier evidence correctly and unblock consumers.
   - If it fails once, record fingerprint and run one bounded repair.
   - If the same gate fails twice consecutively, block only that track and continue others.
   - If all in-scope criteria are >=8 and every required verifier is done, print FINAL with
     exact Production URL/SHA/evidence and residual deferred scope.
   - If only named human/access/policy gates remain, print WAITING with the minimum exact
     inputs and owners. Never call blocked technical work a human gate.
   - Otherwise print ITERATING and begin the next eligible node without asking.

FINAL means the dedicated Production URL—not a Preview—passes the real two-person committee
bar and the old TailAdmin surface is gone/redirected. Green CI alone is never FINAL.

Begin.
```
