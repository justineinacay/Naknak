-- P1 billing foundation: read-only verified subscription periods.
-- STAGED FOR REVIEW, NOT DEPLOYED. This table does not implement checkout,
-- recurring charges, refunds, cancellation or payment verification.
-- Only a trusted server-side payment integration may write these rows.

create table if not exists public.naknak_family_subscriptions (
  household_id uuid primary key references public.naknak_households(id) on delete cascade,
  provider text not null check (provider in ('paymongo','apple','google','manual')),
  provider_subscription_id text,
  billing_cycle text not null check (billing_cycle in ('monthly','annual')),
  status text not null check (status in ('pending','active','past_due','canceled','expired')),
  period_start timestamptz,
  period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint naknak_subscription_period_valid check (
    period_start is null or period_end is null or period_end > period_start
  ),
  constraint naknak_active_period_required check (
    status <> 'active' or (period_start is not null and period_end is not null)
  )
);
create unique index if not exists naknak_family_subscriptions_provider_id_idx
  on public.naknak_family_subscriptions(provider, provider_subscription_id)
  where provider_subscription_id is not null;
alter table public.naknak_family_subscriptions enable row level security;
revoke all on table public.naknak_family_subscriptions from public, anon, authenticated;
grant select on table public.naknak_family_subscriptions to authenticated;

drop policy if exists "naknak subscription view own household" on public.naknak_family_subscriptions;
create policy "naknak subscription view own household" on public.naknak_family_subscriptions
for select to authenticated
using (household_id in (
  select household_id from public.naknak_household_members
  where auth_uid=(select auth.uid())
));

-- Never grant insert/update/delete to authenticated or anon. No browser RPC
-- is allowed to activate entitlements. Require payment provider verification,
-- subscription lifecycle webhooks, and reconciliation before first activation.
