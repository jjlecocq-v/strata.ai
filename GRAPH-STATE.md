# strata.ai first-Production graph state

Updated: 2026-08-23 Australia/Sydney

Authoritative base: `jjlecocq-v/strata.ai` `codex/strata-v1-release-candidate` @ `21fedf7c49b13a0aeb10013ddce8bd9ca6181b07`

State syntax: `id | pending|in-progress|blocked(on)|done | evidence`

## Nodes

scope-router | done | decisions #4 replace; #5 verified fallback; #7 no meetings/intake; #8 defer Track E; B/D/E/meetings/#38 excluded from v1
runner-router | done | factory/Foreman unavailable while jjlecocq-v GitHub connection fails; route selected = human or later agent with identical contracts
baseline-rc | done | fork SHA 21fedf7; CI run 32526860349 passed five jobs on 2026-08-21; GRAPH-AUDIT-2026-08.md
committee-identity | pending | gap: StrataAppData has no committee object and building-platform-data.ts:53 hard-codes Strata Governance Command
verify-committee-identity | blocked(committee-identity) | requires two-committee + signed-out behavioural proof
motion-audit-read | pending | gap: strata-app-data.ts:881 omits motion_id although mapAudit consumes it
verify-motion-audit-read | blocked(motion-audit-read) | requires HTTP/UI event round-trip and cross-tenant negative
motion-attach-open | pending | existing fork issue #1; no motion relation, motion file UI, or scoped open path
verify-motion-attach-open | blocked(motion-attach-open) | requires exact-byte open plus expired/hidden/cross-tenant denial
production-fallback | pending | runtime-configuration.ts:183-187 rejects locked fallback in Production; README.md:176 requires live
verify-production-fallback | blocked(production-fallback) | requires production-like build/config, RLS personas, no fixtures, no Gateway call
live-capability-reconcile | pending | live 2026-08-23: 202608160001 absent; can_access_document/can_access_incident/enforcement triggers missing; old policies remain
verify-live-capabilities | blocked(live-capability-reconcile) | requires independent catalog manifest and isolated six-persona behavioural RLS
live-data-sanitize | blocked(operator-targeted-cleanup-unlock) | exact-ID manifest/backup required; live has 4 test members and 3 fixture-looking cards; no broad reconcile/reset
verify-live-data | blocked(live-data-sanitize) | requires exact before/after diff retaining committee, JJ, storage, law, and empty motions
production-auth-config | blocked(vercel-target-scope-and-production-hostname) | target team jjlecocq-8187s-projects inaccessible to current connector; Supabase leaked-password protection disabled
verify-production-auth | blocked(production-auth-config) | requires exact allowlist/settings read-back and non-mailbox callback proof
second-real-member | blocked(operator-member-identity-and-recipient-acceptance) | source invite/accept exists; live has no accepted second real committee member
verify-second-real-member | blocked(second-real-member) | requires two distinct human sessions and attributed second-member approval
candidate-preview | blocked(source-verifiers) | deploy Preview only after all four source verifier nodes pass and full fork CI is green
secretary-preview-rehearsal | blocked(candidate-preview,live-verifiers,auth-verifier,member-verifier,secretary-session) | six-part exact-candidate evidence not yet captured
production-unlock | blocked(secretary-preview-rehearsal-and-operator-GO) | required token: GO <sha> <deployment-id> <hostname>
production-release | blocked(production-unlock) | no dedicated Production URL or approved rollback target yet
production-smoke | blocked(production-release) | non-destructive two-session Production proof required
retire-tailadmin | blocked(production-smoke) | strata-ai.vercel.app still serves public TailAdmin demo as of 2026-08-23
verify-public-surface | blocked(retire-tailadmin) | verify new locked URL, old URL absent/redirected, no loop, recovery reachable
release-record | blocked(all-in-scope-verifiers) | terminal evidence reduce; deferred tracks must remain explicitly deferred

## Routers

v1-scope | done | include only production bar 1–6
frontend-route | done | replace; cards/votes/updates/people vocabulary canonical
ai-route | done | verified fallback; live Gateway is later opt-in
meetings-intake-route | done | no; Track B and meeting mode have no v1 fan-in
track-d-route | done | Eve drafts excluded from the six-part first-Production fan-in
track-e-route | done | defer-track-e-post-v1
notifications-route | done | #38 excluded from v1
runner-route | done | human/later agent until GitHub/Foreman connection works; product dependencies unchanged
production-route | blocked(operator-GO-after-rehearsal) | no Production command or mutation before exact GO

## Delivery state for this audit

artifact-branch | done | isolated branch `codex/graph-audit-2026-08`; initial audit commit e97d337; five files validated; no product-code paths changed
issue-sync | done | existing fork #1 retained; narrow remainder issues #2–#11 created on 2026-08-23
branch-push | done | `codex/graph-audit-2026-08` pushed to `jjlecocq-v/strata.ai`
pull-request | done | fork PR #12: https://github.com/jjlecocq-v/strata.ai/pull/12 → codex/strata-v1-release-candidate

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
