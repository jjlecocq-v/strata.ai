-- Additional sourced financial figures for SP 6430 budget forecast.
-- Updates opening cash balance, insurance, recurring admin expenses, and known capital works outflows.
-- All figures from Gmail emails, broker PDFs, AGM minutes, or EBRS certificates.
-- DO NOT invent figures. Mark each as sourced vs assumed.

-- Update opening fund balance with Ben Pattinson email figure (27-28 Jul 2026).
-- Scheme available funds $691,354.58 (UNSPLIT: admin vs CWF vs TD split unknown).
-- Store as unallocated until a statement shows the split.
-- Replace the missing placeholders with this sourced figure.
delete from public.fund_balances where committee_id = '11111111-1111-1111-1111-111111111111' and source = 'missing';

insert into public.fund_balances (committee_id, account_id, balance_as_of, balance_amount, balance_type, source, notes)
values
  ('11111111-1111-1111-1111-111111111111', null, '2026-07-28', 691354.58, 'current', 'Ben Pattinson email 27-28 Jul 2026', 'Scheme available funds (unsplit: admin vs CWF vs term deposit split unknown). Term deposit needs 31 days notice. Prior snapshot 1 Jul 2025: $841,758.09')
on conflict do nothing;

-- Admin fund opening balance: set to zero pending split, with note.
insert into public.fund_balances (committee_id, account_id, balance_as_of, balance_amount, balance_type, source, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-07-28', 0, 'current', 'assumed', 'Admin fund share of $691k unknown; awaiting statement to split admin vs CWF vs TD')
on conflict do nothing;

-- Capital works fund opening balance: set to zero pending split, with note.
insert into public.fund_balances (committee_id, account_id, balance_as_of, balance_amount, balance_type, source, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-07-28', 0, 'current', 'assumed', 'Capital works share of $691k unknown; awaiting statement to split admin vs CWF vs TD')
on conflict do nothing;

-- Special levy fund: starts at zero (no prior balance).
insert into public.fund_balances (committee_id, account_id, balance_as_of, balance_amount, balance_type, source, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-07-28', 0, 'current', 'sourced', 'Special levy fund starts at zero; inflows from special levy instalments')
on conflict do nothing;

-- Known admin fund outflows (create expenses table entries if they don't exist).
-- Insurance FY27: CHU 04/08/2026–04/08/2027 total $84,210.97 (broker PDF).
-- Last paid 4 Aug 2025: $79,195.03 (AGM minutes).
-- BSI $29,035,519; excess $10,000.
insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-insurance2027', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Insurance FY27 CHU 04/08/2026–04/08/2027 (broker PDF). BSI $29,035,519; excess $10k. Last paid 4 Aug 2025: $79,195.03', 84210.97, '2026-08-04')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

-- Recurring admin expenses (AGM motion 2.11).
-- Electricity Origin $3,366.10 pa (assume quarterly $841.53).
insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-elec-2026q3', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Electricity Origin Q3 2026 (AGM 2.11: $3,366.10 pa)', 841.53, '2026-09-30')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-elec-2026q4', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Electricity Origin Q4 2026 (AGM 2.11: $3,366.10 pa)', 841.53, '2026-12-31')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-elec-2027q1', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Electricity Origin Q1 2027 (AGM 2.11: $3,366.10 pa)', 841.53, '2027-03-31')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-elec-2027q2', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Electricity Origin Q2 2027 (AGM 2.11: $3,366.10 pa)', 841.51, '2027-06-30')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

-- Water Sydney Water $7,048.80 pa (assume quarterly $1,762.20).
insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-water-2026q3', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Water Sydney Water Q3 2026 (AGM 2.11: $7,048.80 pa)', 1762.20, '2026-09-30')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-water-2026q4', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Water Sydney Water Q4 2026 (AGM 2.11: $7,048.80 pa)', 1762.20, '2026-12-31')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-water-2027q1', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Water Sydney Water Q1 2027 (AGM 2.11: $7,048.80 pa)', 1762.20, '2027-03-31')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-water-2027q2', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, null, null, 'Water Sydney Water Q2 2027 (AGM 2.11: $7,048.80 pa)', 1762.20, '2027-06-30')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

-- Capital works outflows: EBRS invoices and variations (sourced from certificates and motions).
-- EBRS 1322 $68,129.91 and 1323 $94,483.65 (due 12 Aug 2026). Updated project value $1,658,418.24 incl GST (NB certs 19/20).
insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-ebrs1322', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, null, null, 'EBRS 1322 (due 12 Aug 2026). Updated project value $1,658,418.24 incl GST (NB certs 19/20)', 68129.91, '2026-08-12')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-ebrs1323', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, null, null, 'EBRS 1323 (due 12 Aug 2026). Updated project value $1,658,418.24 incl GST (NB certs 19/20)', 94483.65, '2026-08-12')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

-- 20 Jul 2026 pair: $103,888.13 and $90,161.65.
insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-ebrs20jul1', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, null, null, 'EBRS invoice 20 Jul 2026 (pair 1 of 2)', 103888.13, '2026-07-20')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-ebrs20jul2', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, null, null, 'EBRS invoice 20 Jul 2026 (pair 2 of 2)', 90161.65, '2026-07-20')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

-- V72 rooftop pointing $2,681.25 incl GST.
insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-v72rooftop', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, null, null, 'V72 rooftop pointing incl GST', 2681.25, '2026-08-01')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

-- AGM 5.1 EBRS units 13 & 14 quote $237,767.25 ex HBCF (passed).
-- Mark as committed, not yet spent (assumed spend date).
insert into public.expenses (id, committee_id, account_id, budget_line_id, project_id, invoice_id, description, amount, spent_on)
values
  ('eeeeeeee-eeee-eeee-eeee-units1314', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', null, null, null, 'AGM 5.1 EBRS units 13 & 14 quote $237,767.25 ex HBCF (passed, assumed spend)', 237767.25, '2026-10-01')
on conflict (id) do update set amount = excluded.amount, description = excluded.description, spent_on = excluded.spent_on;

-- Collection risk: Unit 4 arrears $35,600.98 (22 Jun 2026). Proposed $3k/month payment plan.
-- DO NOT add to opening cash or treat as inflow. This is arrears, not available funds.
-- Seed as note only, not as a transaction.
comment on table public.fund_balances is 'Fund balance snapshots. Unit 4 arrears $35,600.98 (22 Jun 2026) is collection risk, not opening cash. Proposed $3k/month payment plan.';

-- Ric 20 Mar briefing (NOT adopted): 15% ($130k) contingency; $127k CWF surplus forecast; $250–300k if contingency unused.
-- Adopted control totals remain the 14 Apr AGM minutes. Do NOT use the briefing figures.
-- Line-item budget pack (Draft AGM Papers V2.pdf, Capital Works Fund Forecast F26.pdf) not yet extracted.
-- Gmail message/thread id `19d0a145c290125a` (20 Mar 2026).
-- If those files are not in the repo, levy inflows + known outflows are seeded above; expense categories remain editable.
