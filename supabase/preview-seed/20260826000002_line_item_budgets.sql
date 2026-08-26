-- Line-item budgets and fund balances from Draft AGM Papers V2.pdf (20 Mar 2026)
-- and Capital Works Fund Forecast F26.pdf.
-- Position as at 20 Mar 2026 (AGM p. 60) provides fund split.
-- Later Ben Pattinson email 27 Jul 2026 cited $691,354.58 unsplit (later snapshot, cash check only).

-- Only seed if committee exists (skip if running against empty DB).
do $$
begin
  if not exists (select 1 from public.committees where id = '11111111-1111-1111-1111-111111111111'::uuid) then
    return;
  end if;

  -- Fund balances as at 20 Mar 2026 (AGM p. 60).
  -- This is the sourced fund split. Use these for opening equity.
  -- Delete the assumed $0 placeholders and replace with the 20 Mar split.
  delete from public.fund_balances 
  where committee_id = '11111111-1111-1111-1111-111111111111' 
    and (source = 'assumed' or balance_as_of = '2026-07-28');

  insert into public.fund_balances (committee_id, account_id, balance_as_of, balance_amount, balance_type, source, notes)
  values
  -- Admin fund equity as at 20 Mar 2026: deficit $48,229.55 (AGM p. 60).
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-03-20', -48229.55, 'opening', 'Draft AGM Papers V2.pdf p. 60 (20 Mar 2026)', 'Admin equity deficit. FY24/25 close: admin ($29,343.99). Cash $427,628.95; net assets $435,616.58 as at 20 Mar 2026'),
  -- Capital works fund equity as at 20 Mar 2026: surplus $483,846.13 (AGM p. 60).
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-03-20', 483846.13, 'opening', 'Draft AGM Papers V2.pdf p. 60 (20 Mar 2026)', 'CWF equity surplus. FY24/25 close: CWF $653,882.48. Cash $427,628.95; net assets $435,616.58 as at 20 Mar 2026'),
  -- Special levy fund: starts at zero (no prior balance).
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-03-20', 0, 'opening', 'Draft AGM Papers V2.pdf (20 Mar 2026)', 'Special levy fund starts at zero; inflows from special levy instalments'),
  -- Ben Pattinson email 27 Jul 2026: unsplit scheme funds $691,354.58 (later snapshot, cash check only).
  -- This is a later unsplit cash figure. Do NOT replace the 20 Mar fund split; mark as a later check.
  ('11111111-1111-1111-1111-111111111111', null, '2026-07-28', 691354.58, 'current', 'Ben Pattinson email 27-28 Jul 2026', 'Later unsplit cash check (term deposit needs 31 days notice). Use 20 Mar 2026 split for opening equity: admin ($48k deficit), CWF $484k surplus')
  on conflict do nothing;

-- Admin fund budget lines (Draft AGM Papers V2.pdf, printed header 07/25-06/26; motion 7.4 says adopt 01/07/26-30/06/27).
-- Total expenditure $144,360.00. Interest revenue $2,000. Levies $174,000.00 inc GST. Opening deficit $29,343.99. Planned surplus ($13,522.17).
-- NOTE: Live insurance renewal is $84,210.97 vs this $75,000 budget line. Show variance; do not replace.

  insert into public.budget_lines (id, committee_id, budget_period_id, account_id, category, approved_amount)
  values
  ('bbbbbbbb-line-admin-audit', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Accountant audit', 650.00),
  ('bbbbbbbb-line-admin-cleaning', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cleaning', 10000.00),
  ('bbbbbbbb-line-admin-elecrepair', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electrical repairs', 2000.00),
  ('bbbbbbbb-line-admin-electricity', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electricity', 3500.00),
  ('bbbbbbbb-line-admin-fireprot', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fire protection', 1000.00),
  ('bbbbbbbb-line-admin-garage', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Garage door', 1000.00),
  ('bbbbbbbb-line-admin-garden', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Garden', 4500.00),
  ('bbbbbbbb-line-admin-genrepair', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'General repairs', 4000.00),
  ('bbbbbbbb-line-admin-insurance', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Insurance premiums', 75000.00),
  ('bbbbbbbb-line-admin-lift', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lift', 7000.00),
  ('bbbbbbbb-line-admin-lockkey', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lock & key', 500.00),
  ('bbbbbbbb-line-admin-stratahub', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NSW Strata Hub annual', 150.00),
  ('bbbbbbbb-line-admin-tax', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tax management', 1800.00),
  ('bbbbbbbb-line-admin-ocadditional', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'OC additional services', 14000.00),
  ('bbbbbbbb-line-admin-ocdisbursements', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'OC disbursements', 1200.00),
  ('bbbbbbbb-line-admin-ocmgmt', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'OC management fees', 5700.00),
  ('bbbbbbbb-line-admin-ocworkorders', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'OC work orders', 1000.00),
  ('bbbbbbbb-line-admin-plumbing', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Plumbing', 3000.00),
  ('bbbbbbbb-line-admin-roofanchors', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Roof anchors', 650.00),
  ('bbbbbbbb-line-admin-strahareg', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Strata Hub registration', 60.00),
  ('bbbbbbbb-line-admin-liftreg', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lift registration', 100.00),
  ('bbbbbbbb-line-admin-waste', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Waste', 550.00),
  ('bbbbbbbb-line-admin-water', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Water', 7000.00)
  on conflict (id) do update set approved_amount = excluded.approved_amount, category = excluded.category;

-- Admin revenue lines (interest revenue $2,000).
-- No separate revenue table; note in comment.
comment on table public.budget_lines is 'Budget lines show approved expenditure. Admin interest revenue $2,000 (AGM papers p. 60). Total admin expenditure $144,360; levies $174,000 inc GST; opening deficit $29,343.99; planned surplus ($13,522.17). NOTE: Live insurance renewal $84,210.97 vs budget $75,000—show variance.';

-- Capital works fund budget lines (Draft AGM Papers V2.pdf p. 68 and Capital Works Fund Forecast F26.pdf).
-- Special Levy Expenses $1,660,000; Stairs/Floors/Balconies $27,000; total spend $1,687,000.
-- Additional revenue: Special Levy $1,125,000 (NOTE: adopted minutes say $575k inc GST, not $1,125k).
-- Opening surplus $653,882.48. Planned surplus $229,192.48. GST on levies $13,731. Levies $151,041.00.

  insert into public.budget_lines (id, committee_id, budget_period_id, account_id, category, approved_amount)
  values
  ('bbbbbbbb-line-cwf-speciallevy', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Special Levy Expenses', 1660000.00),
  ('bbbbbbbb-line-cwf-stairsfloors', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Stairs/Floors/Balconies', 27000.00)
  on conflict (id) do update set approved_amount = excluded.approved_amount, category = excluded.category;

-- F26 forecast PDF (one page) summary:
-- Open $653,882; annual levy $151,040; SL1 $550,000; SL2 $575,000; available $1,929,922;
-- project incl contingencies $1,826,000; other $30,000; GST $52,724; closing $126,646.
-- AGM p.43 remaining $996,673 incl 15% contingency $130,001; forecast total $2,123,640;
-- footnote: Forecast Total Expenses F26 $1,825,536.
-- These are forecasts and work-in-progress. Adopted control totals remain the 14 Apr AGM minutes.

-- Draft vs adopted special levy wording:
-- Minutes (adopted 14 Apr) say special levy $575,000.00 inc GST.
-- Draft papers motion 6.1 says $575,000.00 plus GST and a lot table footer $632,500.
-- Use the adopted minutes for levy inflows: $575,000 inc GST, two instalments 15 May and 16 June.
-- Mark the $632,500 draft footer as NOT adopted.
comment on column public.levy_schedules.amount is 'Levy amount inc GST. Adopted minutes 14 Apr 2026: special levy $575,000 inc GST. Draft motion 6.1 footer $632,500 NOT adopted.';

-- Update insurance expense to link to budget line and show variance.
  update public.expenses
  set budget_line_id = 'bbbbbbbb-line-admin-insurance',
    description = 'Insurance FY27 CHU 04/08/2026–04/08/2027 (broker PDF $84,210.97). BSI $29,035,519; excess $10k. Last paid 4 Aug 2025: $79,195.03. Budget line $75,000 → variance $9,210.97 over'
  where id = 'eeeeeeee-eeee-eeee-eeee-insurance2027';

-- Update electricity expenses to link to budget line.
  update public.expenses
  set budget_line_id = 'bbbbbbbb-line-admin-electricity'
  where id in ('eeeeeeee-eeee-eeee-eeee-elec-2026q3', 'eeeeeeee-eeee-eeee-eeee-elec-2026q4', 'eeeeeeee-eeee-eeee-eeee-elec-2027q1', 'eeeeeeee-eeee-eeee-eeee-elec-2027q2');

-- Update water expenses to link to budget line.
  update public.expenses
  set budget_line_id = 'bbbbbbbb-line-admin-water'
where id in ('eeeeeeee-eeee-eeee-eeee-water-2026q3', 'eeeeeeee-eeee-eeee-eeee-water-2026q4', 'eeeeeeee-eeee-eeee-eeee-water-2027q1', 'eeeeeeee-eeee-eeee-eeee-water-2027q2');

-- Update capital works expenses to link to budget line (Special Levy Expenses).
  update public.expenses
  set budget_line_id = 'bbbbbbbb-line-cwf-speciallevy'
  where id in ('eeeeeeee-eeee-eeee-eeee-ebrs1322', 'eeeeeeee-eeee-eeee-eeee-ebrs1323', 'eeeeeeee-eeee-eeee-eeee-ebrs20jul1', 'eeeeeeee-eeee-eeee-eeee-ebrs20jul2', 'eeeeeeee-eeee-eeee-eeee-v72rooftop', 'eeeeeeee-eeee-eeee-eeee-units1314');
end $$;
