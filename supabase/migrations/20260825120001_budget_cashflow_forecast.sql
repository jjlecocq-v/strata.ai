-- Budget cashflow forecast schema for committee-usable financial management.
-- Adds levy schedules, fund balances, and cashflow projection support to existing
-- accounts/budget_periods/budget_lines/budget_allowances/expenses/invoices tables.

-- Strata: separate administrative fund and capital works fund. Special levies
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
comment on column public.levy_schedules.purpose is 'Purpose description for special levies';
comment on column public.levy_schedules.source is 'Source reference (e.g. "AGM", "manual")';

-- Fund balances: opening and current position for admin + capital + special levy funds.
-- Strata requires separate tracking. Opening balance comes from last statement or
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
comment on column public.fund_balances.source is 'Source reference (e.g. "bank statement", "treasurer estimate")';

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
comment on column public.cashflow_forecast.forecast_month is 'First day of forecast month';
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

