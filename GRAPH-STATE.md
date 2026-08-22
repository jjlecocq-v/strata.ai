# strata.ai first-Production graph state

Updated: 2026-08-23 Australia/Sydney

Authoritative base: `jjlecocq-v/strata.ai` `codex/strata-v1-release-candidate` @ `21fedf7c49b13a0aeb10013ddce8bd9ca6181b07`

Working branch: `cursor/wave-1a-source-0b32` (evidence commit after candidate)

Immutable WAVE 2 candidate SHA: `785fca801014c199b3895ba5df2a2ac06bfed84b` (product maker `96a636b` + prior state). Later GRAPH-STATE-only commits do not replace this candidate.

State syntax: `id | pending|in-progress|blocked(on)|done | evidence`

## Nodes

scope-router | done | decisions #4 replace; #5 verified fallback; #7 no meetings/intake; #8 defer Track E; B/D/E/meetings/#38 excluded from v1
runner-router | done | this agent executing source contracts; product dependencies unchanged
baseline-rc | done | RC tip still 21fedf7; no post-audit delta; CI run 32526860349; GRAPH-AUDIT-2026-08.md
committee-identity | done | maker SHA 96a636b; StrataAppData.committee + adapter/shell; signed-out null; generic live label removed
verify-committee-identity | done | independent fork CI e2e (not maker self-grade): `e2e/journeys/committee-identity.spec.ts` passed in run 32605695454 on 785fca8 (test 29, 386ms)
motion-audit-read | done | maker SHA 96a636b; audit_log select includes motion_id; mapAudit/motion.audit unchanged
verify-motion-audit-read | done | independent fork CI e2e: `e2e/journeys/motion-audit.spec.ts` passed in run 32605695454 on 785fca8 (test 37, 1.8s)
motion-attach-open | done | maker SHA 96a636b; migration 20260823120001; create motionId; /api/documents/open; drawer attach/open
verify-motion-attach-open | done | independent fork CI e2e: `e2e/journeys/motion-documents.spec.ts` passed in run 32605695454 on 785fca8 (test 38, 3.4s; exact bytes + hidden/expired/cross-tenant)
production-fallback | done | maker SHA 96a636b; Production accepts explicit fallback; fixture still forbidden; README/ADR/contract aligned
verify-production-fallback | done | distinct command pass: npm run verify:fail-closed (23 runtime + production-like AI negatives) and STRATA_VERIFY_STATIC_ONLY=1 npm run verify:ai; lint/typecheck/verify:frontend-contract passed; reconfirmed in CI source-inspection + lint/typecheck/build on 785fca8
live-capability-reconcile | blocked(operator-live-supabase-apply-unlock) | Jean-Julien: backup + reviewed apply of 202608160001 to osgvagsouxgbrnbljhxb; this run must not mutate live Supabase
verify-live-capabilities | blocked(operator-live-supabase-apply-unlock) | independent catalog/persona proof after operator apply
live-data-sanitize | blocked(operator-targeted-cleanup-unlock) | Jean-Julien: approve exact-ID manifest/backup; this run must not mutate live data
verify-live-data | blocked(operator-targeted-cleanup-unlock) | exact before/after diff after operator unlock
production-auth-config | blocked(operator-vercel-target-scope-and-production-hostname) | Jean-Julien: named Production hostname for team jjlecocq-8187s-projects (Git integration already deploys Preview)
verify-production-auth | blocked(operator-vercel-target-scope-and-production-hostname) | allowlist/settings read-back after operator input
second-real-member | blocked(operator-member-identity-and-recipient-acceptance) | Jean-Julien: name/email/role of one real SP 6430 member + recipient availability
verify-second-real-member | blocked(operator-member-identity-and-recipient-acceptance) | two distinct human sessions after named invite
candidate-preview | done | Preview only of 785fca8; GitHub environment=Preview (deployment 6042476479); Vercel id FTg1ZPEFLSMwMTyjL1dYSBRvoJQd; no Production env for this SHA
secretary-preview-rehearsal | blocked(candidate-preview,live-verifiers,auth-verifier,member-verifier,secretary-session) | six-part exact-candidate evidence not yet captured; wait for Wave 1B operator gates
production-unlock | blocked(operator-GO-after-rehearsal) | required token: GO <sha> <deployment-id> <hostname>
production-release | blocked(operator-GO-after-rehearsal) | this run must not vercel --prod
production-smoke | blocked(operator-GO-after-rehearsal) | non-destructive two-session Production proof required
retire-tailadmin | blocked(operator-GO-after-rehearsal) | strata-ai.vercel.app still public 200 / cache HIT as of 2026-08-22T23:43Z; ETag 81c4fa1217800c98e2a9fd404e3a241e
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

## WAVE 2 exact candidate (Preview only)

- SHA: `785fca801014c199b3895ba5df2a2ac06bfed84b`
- Source fan-in: four WAVE 1A concerns already one branch/PR (shared `src/lib/strata-app-data.ts` prevented isolated PRs)
- Full fork CI: https://github.com/jjlecocq-v/strata.ai/actions/runs/32605695454 — all five jobs success (lint/typecheck/build, source inspection, behavioural RLS, migration replay, E2E+axe 41 passed)
- GitHub deployment: id `6042476479`, environment `Preview` (only environment on this SHA)
- Vercel deployment: `FTg1ZPEFLSMwMTyjL1dYSBRvoJQd`
- Preview URLs (SSO-protected):
  - `https://strata-ai-git-cursor-wave-1a-sou-c62f1c-jjlecocq-8187s-projects.vercel.app`
  - `https://strata-pgp7rwgq9-jjlecocq-8187s-projects.vercel.app`
- target: `preview` (GitHub `environment=Preview`; Vercel Git status success; curl 302 to `vercel.com/sso-api`; `cache-control: no-store`; `x-robots-tag: noindex`)
- Runtime attestation: signed-out fetch of Preview is Deployment Protection SSO, not an app 200; `x-vercel-id` present; no `--prod` / promote / alias was used
- Production before/after: GitHub lists **no** Production deployment for 785fca8. Public `https://strata-ai.vercel.app` remains HTTP 200, `x-vercel-cache: HIT`, `age` ~1.49e6s, ETag `81c4fa1217800c98e2a9fd404e3a241e` (unchanged public TailAdmin/demo surface)

## Delivery state for this audit

artifact-branch | done | WAVE 1A+2 source on `cursor/wave-1a-source-0b32`; candidate pinned 785fca8; PR #13 open vs RC
issue-sync | done | #1–#4 verifier CI pointers; #9 candidate Preview recorded; #5–#8/#10–#11 remain WAITING; no Lajij writes
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

## WAITING — operator inputs (Wave 1B / Wave 3)

1. `#5` backup + unlock to apply `202608160001` to live `osgvagsouxgbrnbljhxb`
2. `#6` backup + exact-ID sanitize unlock (no reset / no committee-wide delete)
3. `#7` Production hostname + auth allowlist (Vercel team `jjlecocq-8187s-projects` known; hostname still needed)
4. `#8` real second member name/email/role + recipient availability
5. Wave 3: exact `GO <sha> <deployment-id> <hostname>` — no `--prod`

Suggested GO fields if rehearsal later accepts this candidate: `GO 785fca801014c199b3895ba5df2a2ac06bfed84b FTg1ZPEFLSMwMTyjL1dYSBRvoJQd <production-hostname>`
