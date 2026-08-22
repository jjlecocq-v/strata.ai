# strata.ai decision record

Revalidated: 2026-08-23 (Australia/Sydney)

Scope: first Production for SP 6430 / 33 Malvern

Purpose: immutable router inputs for `GRAPH-PLAN.md`; this document is not an invitation to reopen locked decisions.

| # | Decision | Recorded answer | Effect on the new graph |
|---|---|---|---|
| 1 | Gmail accounts/labels and inclusive date range Track B may read | **Pending human answer** | Gates deferred Track B only. No mailbox access and no v1 delay. |
| 2 | Retention, confidentiality, exclusions, access, and deletion rules for imported mail/attachments | **Pending human answer** | Gates deferred Track B only. No mailbox access and no v1 delay. |
| 3 | Who may approve imported records and Eve drafts | **Repository operator/owner**, recorded 2026-08-02 | Later-track policy only; Eve drafts are outside the first-Production fan-in. |
| 4 | Frontend replace vs refactor | **Replace**, recorded 2026-08-01 | Locked. Cards/votes/updates/people is canonical language. |
| 5 | v1 AI live Gateway vs fallback | **Verified fallback**, recorded 2026-08-04 and reaffirmed for this graph | Locked. `STRATA_AI_RELEASE_MODE=fallback`; live Gateway is later explicit opt-in. The current Production rejection is a release gap, not a reason to reopen the decision. |
| 6 | Preview environment-variable names | **Approved publishable/secret names**, recorded 2026-08-04 | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may be public; server/service keys remain server-only and never enter `NEXT_PUBLIC_*`. |
| 7 | Reviewed intake/meeting mode in v1 | **No**, recorded 2026-08-04 | Locked router excludes Track B, meetings, and minutes from v1 rehearsal. |
| 8 | Track E in first release | **`defer-track-e-post-v1`**, recorded 2026-08-04 | Locked router excludes finance/Track E from v1 rehearsal. |
| 9 | Photo confidentiality/consent/visibility/retention/redaction/deletion | **Pending human answer** | Gates deferred photo/Track E work only; no v1 delay. |
| 10 | Named confirm-figure authority and draft→official model | **Pending human answer** | Gates deferred finance/Track E work only; no v1 delay. |

## Other locked release rules

- Approval outcome is a simple majority of votes cast. Eligible count is never the denominator. A 0–0 decision is `failed`.
- Live and staging fail closed. Missing/unavailable data is empty or a typed non-2xx response; no fire-door/demo substitution.
- The first-Production bar is exactly vision items 1–6 in `GRAPH-AUDIT-2026-08.md`.
- Eve drafts and inbox notifications #38 are also excluded from the first-Production fan-in.
- The factory/Foreman outage is a runner choice, not a scope or dependency decision. A human or later agent may execute the same graph.
- Production remains locked until the exact-candidate rehearsal passes and the operator gives `GO <sha> <deployment-id> <hostname>`.

Operator sign-off already recorded: decisions #3–#8.

Pending later-scope answers: #1–#2 and #9–#10.

Committee participation still required for: the named second real member, recipient acceptance, secretary rehearsal, targeted live-data cleanup approval, and final Production GO.
