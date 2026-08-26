-- Budget cashflow forecast schema for SP 6430 committee-usable financial management.
-- Adds levy schedules, fund balances, and cashflow projection support to existing
-- accounts/budget_periods/budget_lines/budget_allowances/expenses/invoices tables.

-- NSW strata: separate administrative fund and capital works fund. Special levies
-- may be purpose-restricted. Levy schedules track quarterly contributions plus
-- special levies adopted by the committee.
create table public.levy_schedules (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  budget_period_id uuid references public.budget_periods(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  levy_type text not null check (levy_type in ('admin', 'capital', 'special')),
  purpose text,
  amount numeric(12,2) not null default 0,
  due_on date not null,
  issued_on date,
  source text not null default 'manual',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists levy_schedules_committee_id_idx on public.levy_schedules (committee_id);
create index if not exists levy_schedules_due_on_idx on public.levy_schedules (committee_id, due_on);
create index if not exists levy_schedules_period_idx on public.levy_schedules (budget_period_id);

comment on table public.levy_schedules is 'Levy inflow schedule: admin/capital/special levies with due dates';
comment on column public.levy_schedules.levy_type is 'admin | capital | special';
comment on column public.levy_schedules.purpose is 'Purpose description for special levies (e.g. "balcony/spalling repair s81(4)")';
comment on column public.levy_schedules.source is 'Source reference (e.g. "AGM 14 Apr 2026", "manual")';

-- Fund balances: opening and current position for admin + capital + special levy funds.
-- NSW strata requires separate tracking. Opening balance comes from last statement or
-- committee estimate; current_balance is calculated or entered by treasurer.
create table public.fund_balances (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  balance_as_of date not null,
  balance_amount numeric(12,2) not null default 0,
  balance_type text not null check (balance_type in ('opening', 'current', 'projected')),
  source text not null default 'manual',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists fund_balances_committee_id_idx on public.fund_balances (committee_id);
create index if not exists fund_balances_account_date_idx on public.fund_balances (account_id, balance_as_of desc);

comment on table public.fund_balances is 'Fund balance snapshots: opening, current, or projected for admin/capital/special funds';
comment on column public.fund_balances.balance_type is 'opening | current | projected';
comment on column public.fund_balances.source is 'Source reference (e.g. "bank statement 31 Mar 2026", "treasurer estimate")';

-- Cashflow forecast months: month-by-month projection of levy inflows vs known outflows.
-- UI displays expected cash position per fund so committee can see shortfalls.
create table public.cashflow_forecast (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  forecast_month date not null,
  opening_balance numeric(12,2) not null default 0,
  levy_inflows numeric(12,2) not null default 0,
  known_outflows numeric(12,2) not null default 0,
  projected_balance numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cashflow_forecast_committee_id_idx on public.cashflow_forecast (committee_id);
create index if not exists cashflow_forecast_month_idx on public.cashflow_forecast (committee_id, account_id, forecast_month);

comment on table public.cashflow_forecast is 'Month-by-month cashflow projection: opening + inflows - outflows = projected balance';
comment on column public.cashflow_forecast.forecast_month is 'First day of forecast month (e.g. 2026-07-01)';
comment on column public.cashflow_forecast.levy_inflows is 'Expected levy income for the month';
comment on column public.cashflow_forecast.known_outflows is 'Known committed/invoiced expenses for the month';
comment on column public.cashflow_forecast.projected_balance is 'Projected end-of-month balance';

alter table public.levy_schedules enable row level security;
alter table public.fund_balances enable row level security;
alter table public.cashflow_forecast enable row level security;

-- All active committee members can read levy schedules, fund balances, and cashflow forecasts.
create policy "members read levy schedules" on public.levy_schedules for select to authenticated
using (app_private.is_committee_member(committee_id));

create policy "members read fund balances" on public.fund_balances for select to authenticated
using (app_private.is_committee_member(committee_id));

create policy "members read cashflow forecast" on public.cashflow_forecast for select to authenticated
using (app_private.is_committee_member(committee_id));

-- Finance capability (admin/chair/treasurer) manages levy schedules, fund balances, and forecasts.
create policy "finance capability manages levy schedules" on public.levy_schedules for all to authenticated
using (app_private.has_capability(committee_id, 'manage_finance'))
with check (
  app_private.has_capability(committee_id, 'manage_finance')
  and (budget_period_id is null or exists (select 1 from public.budget_periods period where period.id = levy_schedules.budget_period_id and period.committee_id = levy_schedules.committee_id))
  and (account_id is null or exists (select 1 from public.accounts account where account.id = levy_schedules.account_id and account.committee_id = levy_schedules.committee_id))
);

create policy "finance capability manages fund balances" on public.fund_balances for all to authenticated
using (app_private.has_capability(committee_id, 'manage_finance'))
with check (
  app_private.has_capability(committee_id, 'manage_finance')
  and (account_id is null or exists (select 1 from public.accounts account where account.id = fund_balances.account_id and account.committee_id = fund_balances.committee_id))
);

create policy "finance capability manages cashflow forecast" on public.cashflow_forecast for all to authenticated
using (app_private.has_capability(committee_id, 'manage_finance'))
with check (
  app_private.has_capability(committee_id, 'manage_finance')
  and (account_id is null or exists (select 1 from public.accounts account where account.id = cashflow_forecast.account_id and account.committee_id = cashflow_forecast.committee_id))
);

grant select, insert, update, delete on public.levy_schedules to authenticated;
grant select, insert, update, delete on public.fund_balances to authenticated;
grant select, insert, update, delete on public.cashflow_forecast to authenticated;

-- Seed SP 6430 AGM-adopted data (14 Apr 2026).
-- Committee id: 11111111-1111-1111-1111-111111111111
-- Budget period FY26-27: 01 July 2026 to 30 June 2027
-- DO NOT invent dollar amounts. Use only AGM minutes values.

-- Only seed if committee exists (skip if running against empty DB).
do $$
begin
  if not exists (select 1 from public.committees where id = '11111111-1111-1111-1111-111111111111'::uuid) then
    return;
  end if;

  -- Create accounts for admin fund + capital works fund if they don't exist.
  insert into public.accounts (id, committee_id, name, account_type, opening_balance)
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Administrative fund', 'admin', 0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Capital works fund', 'capital', 0),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Special levy - balcony/spalling', 'special', 0)
  on conflict (id) do nothing;

  -- Create budget period FY26-27 if it doesn't exist.
  insert into public.budget_periods (id, committee_id, name, starts_on, ends_on)
  values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'FY 2026-27', '2026-07-01'::date, '2027-06-30'::date)
  on conflict (id) do nothing;
end $$;

-- Seed levy schedules and fund balances only if committee exists.
do $$
begin
  if not exists (select 1 from public.committees where id = '11111111-1111-1111-1111-111111111111'::uuid) then
    return;
  end if;

  -- Admin fund levy schedule (AGM 14 Apr 2026):
  -- Already issued 01/01/2026 $37,250.00
  -- To be issued 01/04/2026 $45,583.33, 01/07/2026 $45,583.33, 01/10/2026 $45,583.34
  -- Interim levies 01/01/2027 $45,583.34, 01/04/2027 $45,583.34
  -- Total FY26-27: $174,000.00 inc GST
  insert into public.levy_schedules (committee_id, budget_period_id, account_id, levy_type, purpose, amount, due_on, issued_on, source)
  values
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin', 'Admin fund contributions FY26-27', 37250.00, '2026-01-01', '2026-01-01', 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin', 'Admin fund contributions FY26-27', 45583.33, '2026-04-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin', 'Admin fund contributions FY26-27', 45583.33, '2026-07-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin', 'Admin fund contributions FY26-27', 45583.34, '2026-10-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin', 'Interim admin levy (continue quarterly)', 45583.34, '2027-01-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin', 'Interim admin levy (continue quarterly)', 45583.34, '2027-04-01', null, 'AGM 14 Apr 2026')
  on conflict do nothing;

  -- Capital works fund levy schedule (AGM 14 Apr 2026):
  -- Four instalments of $37,760.25 on 01/01, 01/04, 01/07, 01/10/2026
  -- Interim levies 01/01/2027 and 01/04/2027 $37,760.25 each
  -- Total FY26-27: $151,041.00 inc GST
  insert into public.levy_schedules (committee_id, budget_period_id, account_id, levy_type, purpose, amount, due_on, issued_on, source)
  values
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'capital', 'Capital works fund contributions FY26-27', 37760.25, '2026-01-01', '2026-01-01', 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'capital', 'Capital works fund contributions FY26-27', 37760.25, '2026-04-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'capital', 'Capital works fund contributions FY26-27', 37760.25, '2026-07-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'capital', 'Capital works fund contributions FY26-27', 37760.25, '2026-10-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'capital', 'Interim capital works levy (continue quarterly)', 37760.25, '2027-01-01', null, 'AGM 14 Apr 2026'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'capital', 'Interim capital works levy (continue quarterly)', 37760.25, '2027-04-01', null, 'AGM 14 Apr 2026')
  on conflict do nothing;

  -- Special levy for balcony/spalling (AGM 14 Apr 2026, s81(4)):
  -- $575,000.00 inc GST, two instalments due 15 May and 16 June 2026
  insert into public.levy_schedules (committee_id, budget_period_id, account_id, levy_type, purpose, amount, due_on, issued_on, source, notes)
  values
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'special', 'Balcony/spalling repair (s81(4))', 287500.00, '2026-05-15', null, 'AGM 14 Apr 2026', 'Special levy instalment 1 of 2'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb27', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'special', 'Balcony/spalling repair (s81(4))', 287500.00, '2026-06-16', null, 'AGM 14 Apr 2026', 'Special levy instalment 2 of 2')
  on conflict do nothing;

  -- Opening fund balances: AGM minutes do not state opening balances. An email cited
  -- scheme funds of $691,354.58 around insurance renewal, but source is unverified and
  -- split across funds is unknown. Seed opening balances as MISSING (0) with clear notes.
  insert into public.fund_balances (committee_id, account_id, balance_as_of, balance_amount, balance_type, source, notes)
  values
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-30', 0, 'opening', 'missing', 'Opening balance not in AGM minutes; email cited $691k total (unverified, split unknown)'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-30', 0, 'opening', 'missing', 'Opening balance not in AGM minutes; email cited $691k total (unverified, split unknown)'),
    ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-06-30', 0, 'opening', 'missing', 'Special levy fund starts at zero')
  on conflict do nothing;
end $$;

-- Known committed spend from committee motions/decisions (user-provided amounts only).
-- Insurance renewal: ~$84,200 (decided), insurance claims recoveries $68,129.91 + $94,483.65 (decided inflow, timing unknown).
-- Variation 70 Unit 20 painting $8,931 (decided), Variation 31 Unit 20 wardrobe $5,220 (decided).
-- Updated Abate fire quote Q-0885 $6,853 (OPEN vote, not decided).
-- Roof / Variation 72 and Unit 14 slab-edge variations were decided (amounts may be in documents, not invented).
-- DO NOT seed these as expenses/invoices here; they should be entered via the app or seeded separately.
-- This migration only creates the levy schedule + fund balance structure.

-- Cashflow forecast: will be calculated by the app from levy schedules + known expenses.
-- No seed data here; forecast rows are generated by the forecast calculation logic.
