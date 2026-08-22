# strata.ai first-Production graph state

Updated: 2026-08-23 Australia/Sydney

Authoritative base: `jjlecocq-v/strata.ai` `codex/strata-v1-release-candidate` @ `21fedf7c49b13a0aeb10013ddce8bd9ca6181b07`

Working branch: `cursor/wave-1a-source-0b32` @ `9910167` (PR #13)

State syntax: `id | pending|in-progress|blocked(on)|done | evidence`

## Nodes

scope-router | done | decisions #4 replace; #5 verified fallback; #7 no meetings/intake; #8 defer Track E; B/D/E/meetings/#38 excluded from v1
runner-router | done | this agent executing source contracts; product dependencies unchanged
baseline-rc | done | RC tip still 21fedf7; no post-audit delta; CI run 32526860349; GRAPH-AUDIT-2026-08.md
committee-identity | done | maker SHA 96a636b; StrataAppData.committee + adapter/shell; signed-out null; generic live label removed
verify-committee-identity | in-progress | distinct journey e2e/journeys/committee-identity.spec.ts; local Docker/Supabase unavailable; awaiting fork CI e2e
motion-audit-read | done | maker SHA 96a636b; audit_log select includes motion_id; mapAudit/motion.audit unchanged
verify-motion-audit-read | in-progress | distinct journey e2e/journeys/motion-audit.spec.ts; awaiting fork CI e2e
motion-attach-open | done | maker SHA 96a636b; migration 20260823120001; create motionId; /api/documents/open; drawer attach/open
verify-motion-attach-open | in-progress | distinct journey e2e/journeys/motion-documents.spec.ts; awaiting fork CI e2e
production-fallback | done | maker SHA 96a636b; Production accepts explicit fallback; fixture still forbidden; README/ADR/contract aligned
verify-production-fallback | done | distinct command pass: npm run verify:fail-closed (23 runtime + production-like AI negatives) and STRATA_VERIFY_STATIC_ONLY=1 npm run verify:ai; lint/typecheck/verify:frontend-contract passed
live-capability-reconcile | blocked(operator-live-supabase-apply-unlock) | Jean-Julien: backup + reviewed apply of 202608160001 to osgvagsouxgbrnbljhxb; this run must not mutate live Supabase
verify-live-capabilities | blocked(operator-live-supabase-apply-unlock) | independent catalog/persona proof after operator apply
live-data-sanitize | blocked(operator-targeted-cleanup-unlock) | Jean-Julien: approve exact-ID manifest/backup; this run must not mutate live data
verify-live-data | blocked(operator-targeted-cleanup-unlock) | exact before/after diff after operator unlock
production-auth-config | blocked(operator-vercel-target-scope-and-production-hostname) | Jean-Julien: reconnect jjlecocq-8187s-projects + named Production hostname
verify-production-auth | blocked(operator-vercel-target-scope-and-production-hostname) | allowlist/settings read-back after operator input
second-real-member | blocked(operator-member-identity-and-recipient-acceptance) | Jean-Julien: name/email/role of one real SP 6430 member + recipient availability
verify-second-real-member | blocked(operator-member-identity-and-recipient-acceptance) | two distinct human sessions after named invite
candidate-preview | blocked(source-verifiers) | Preview only after remaining source e2e verifiers + full fork CI; Vercel MCP needsAuth
secretary-preview-rehearsal | blocked(candidate-preview,live-verifiers,auth-verifier,member-verifier,secretary-session) | six-part exact-candidate evidence not yet captured
production-unlock | blocked(operator-GO-after-rehearsal) | required token: GO <sha> <deployment-id> <hostname>
production-release | blocked(operator-GO-after-rehearsal) | this run must not vercel --prod
production-smoke | blocked(operator-GO-after-rehearsal) | non-destructive two-session Production proof required
retire-tailadmin | blocked(operator-GO-after-rehearsal) | strata-ai.vercel.app still serves public TailAdmin demo as of 2026-08-23
verify-public-surface | blocked(operator-GO-after-rehearsal) | verify new locked URL, old URL absent/redirected, no loop, recovery reachable
release-record | blocked(all-in-scope-verifiers) | terminal evidence reduce; deferred tracks must remain explicitly deferred

## Routers

v1-scope | done | include only production bar 1–6
frontend-route | done | replace; cards/votes/updates/people vocabulary canonical
ai-route | done | verified fallback; live Gateway is later opt-in
meetings-intake-route | done | no; Track B and meeting mode have no v1 fan-in
track-d-route | done | Eve drafts excluded from the six-part first-Production fan-in
track-e-route | done | defer-track-e-post-v1
notifications-route | done | #38 excluded from v1
runner-route | done | this agent executing source contracts; product dependencies unchanged
production-route | blocked(operator-GO-after-rehearsal) | no Production command or mutation before exact GO

## Delivery state for this audit

artifact-branch | in-progress | `cursor/wave-1a-source-0b32` from `5bedb1c`; product SHA 96a636b; state SHA 9910167
issue-sync | done | #1–#4 updated with maker pointers; #5–#11 documented WAITING; no Lajij writes
branch-push | done | origin/cursor/wave-1a-source-0b32
pull-request | done | https://github.com/jjlecocq-v/strata.ai/pull/13 → codex/strata-v1-release-candidate

## Hard stops

- No `vercel --prod`, promotion, Production deployment, rollback, alias mutation, or equivalent until `production-unlock` contains the exact operator GO.
- No destructive live database reset, broad fixture reconciliation, committee-wide delete, or unreviewed live migration.
- No mailbox read until decisions #1–#2 are recorded; Track B remains excluded even then unless a new scope decision includes it.
- No external email/message or automatic invite retry. A named member invite is a human-gated, one-send action.
- No secret may be printed, committed, logged, or placed in any `NEXT_PUBLIC_*` variable.
- Two consecutive failures of the same gate stop that track, record the normalized failure fingerprint here, and allow independent tracks to continue.
- Maker never marks its own verifier node done.

## Seen gate fingerprints

None yet for the remainder graph.
