-- NakNak P0–P2 operations (REVIEW REQUIRED BEFORE PRODUCTION).
-- Requires existing naknak_households and naknak_household_members schema.
-- This migration is committed for review; not applied to the live project.

create table if not exists public.naknak_household_prep (
  household_id uuid not null references public.naknak_households(id) on delete cascade,
  item_key text not null check (item_key ~ '^[a-z0-9_]{2,48}$'),
  completed boolean not null default false,
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (household_id,item_key)
);
create index if not exists naknak_household_prep_updated_by_idx
  on public.naknak_household_prep(updated_by);
alter table public.naknak_household_prep enable row level security;
revoke all on table public.naknak_household_prep from anon,authenticated;
grant select,insert,update on table public.naknak_household_prep to authenticated;

drop policy if exists "naknak prep select members" on public.naknak_household_prep;
create policy "naknak prep select members" on public.naknak_household_prep
for select to authenticated
using (household_id in
  (select household_id from public.naknak_household_members where auth_uid = (select auth.uid())));

drop policy if exists "naknak prep insert members" on public.naknak_household_prep;
create policy "naknak prep insert members" on public.naknak_household_prep
for insert to authenticated
with check (updated_by = (select auth.uid()) and household_id in
  (select household_id from public.naknak_household_members where auth_uid = (select auth.uid())));

drop policy if exists "naknak prep update members" on public.naknak_household_prep;
create policy "naknak prep update members" on public.naknak_household_prep
for update to authenticated
using (household_id in
  (select household_id from public.naknak_household_members where auth_uid = (select auth.uid())))
with check (updated_by = (select auth.uid()) and household_id in
  (select household_id from public.naknak_household_members where auth_uid = (select auth.uid())));

create table if not exists public.naknak_support_requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.naknak_households(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 5 and 120),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'open' check (status in ('open','in_review','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists naknak_support_requests_requester_idx
  on public.naknak_support_requests(requester_id,created_at desc);
alter table public.naknak_support_requests enable row level security;
revoke all on table public.naknak_support_requests from anon,authenticated;
grant select,insert on table public.naknak_support_requests to authenticated;

drop policy if exists "naknak support view own" on public.naknak_support_requests;
create policy "naknak support view own" on public.naknak_support_requests
for select to authenticated
using (requester_id = (select auth.uid()) and household_id in
  (select household_id from public.naknak_household_members where auth_uid = (select auth.uid())));

drop policy if exists "naknak support create own" on public.naknak_support_requests;
create policy "naknak support create own" on public.naknak_support_requests
for insert to authenticated
with check (requester_id = (select auth.uid()) and status = 'open' and household_id in
  (select household_id from public.naknak_household_members where auth_uid = (select auth.uid())));

-- No client-side UPDATE or DELETE grants for support tickets; status changes
-- require a privileged staff workflow that is not included in this release.
-- App-based requests are NOT an emergency response channel.
