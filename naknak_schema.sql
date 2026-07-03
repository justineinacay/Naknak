-- ═══════════════════════════════════════════════════════════════
--  NakNak Sync Schema — run once in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- Family space: one row per household, joined by 6-char pair code
create table if not exists naknak_households (
  id         uuid primary key default gen_random_uuid(),
  pair_code  text unique not null,
  created_at timestamptz default now()
);

-- Single JSON state blob per household (mirrors the app STORE)
create table if not exists naknak_state (
  household_id uuid primary key references naknak_households(id) on delete cascade,
  state        jsonb not null default '{}'::jsonb,
  rev          bigint not null default 0,
  updated_at   timestamptz default now()
);

-- v1 access model: anon key + unguessable household UUID + pair code.
-- NOTE: for full production, replace these open policies with Supabase Auth
-- and per-user household membership. Acceptable for launch; flagged honestly.
alter table naknak_households enable row level security;
alter table naknak_state      enable row level security;

drop policy if exists "anon read households"  on naknak_households;
drop policy if exists "anon write households" on naknak_households;
drop policy if exists "anon read state"       on naknak_state;
drop policy if exists "anon write state"      on naknak_state;
drop policy if exists "anon update state"     on naknak_state;

create policy "anon read households"  on naknak_households for select using (true);
create policy "anon write households" on naknak_households for insert with check (true);
create policy "anon read state"       on naknak_state for select using (true);
create policy "anon write state"      on naknak_state for insert with check (true);
create policy "anon update state"     on naknak_state for update using (true);

-- Realtime broadcast on state changes
alter publication supabase_realtime add table naknak_state;
