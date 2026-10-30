\set ON_ERROR_STOP on
-- Disposable PostgreSQL CI fixtures, never a production connection.
create schema if not exists auth;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
do $$
begin
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
end
$$;
grant usage on schema public, auth, extensions to authenticated, anon;
create or replace function auth.uid()
returns uuid language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant execute on function auth.uid() to authenticated, anon;
create table auth.users(id uuid primary key);
create table public.naknak_households(id uuid primary key);
create table public.naknak_household_members(
  household_id uuid not null references public.naknak_households(id),
  auth_uid uuid not null references auth.users(id),
  role text not null,
  joined_at timestamptz not null default now(),
  primary key(household_id,auth_uid)
);
insert into auth.users(id) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
insert into public.naknak_households(id) values
('11111111-1111-4111-8111-111111111111'),
('22222222-2222-4222-8222-222222222222');
insert into public.naknak_household_members(household_id,auth_uid,role) values
('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','owner'),
('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','owner');
\ir ../supabase/migrations/20261031093000_secure_caregiver_invitations.sql

-- Verify direct table bypass is not available to API roles.
do $$
begin
  if has_table_privilege('authenticated','public.naknak_caregiver_invites','SELECT') or
     has_table_privilege('authenticated','public.naknak_caregiver_invites','INSERT') or
     has_table_privilege('anon','public.naknak_caregiver_invites','SELECT') then
    raise exception 'Direct invitation table privileges leaked';
  end if;
  if has_function_privilege('anon','public.naknak_invite_accept(text)','EXECUTE') or
     not has_function_privilege('authenticated','public.naknak_invite_accept(text)','EXECUTE') then
    raise exception 'Invite RPC grants are incorrect';
  end if;
end
$$;

set role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
-- Owner B may not invite to owner A's household.
do $$
declare denied boolean:=false;
begin
  begin
    perform public.naknak_invite_create('11111111-1111-4111-8111-111111111111');
  exception when others then denied:=true; end;
  if not denied then raise exception 'Cross-household invitation creation was permitted'; end if;
end $$;

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
select invite_token from public.naknak_invite_create('11111111-1111-4111-8111-111111111111') \gset
select set_config('naknak.ci_invite', :'invite_token', false);
-- Owner A can list pending invites but never retrieve token hashes through RPC.
do $$
begin
  if not exists (
    select 1 from public.naknak_invite_list('11111111-1111-4111-8111-111111111111')
    where status='pending'
  ) then raise exception 'Owner cannot list pending invite'; end if;
end $$;

-- Invited account C accepts exactly once.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',false);
select household_id from public.naknak_invite_accept(current_setting('naknak.ci_invite')) \gset
do $$
declare rejected boolean:=false;
begin
  begin
    perform public.naknak_invite_accept(current_setting('naknak.ci_invite'));
  exception when others then rejected:=true; end;
  if not rejected then raise exception 'Consumed token was reusable'; end if;
end $$;

reset role;
do $$
begin
  if not exists (
    select 1 from public.naknak_household_members
    where household_id='11111111-1111-4111-8111-111111111111'
      and auth_uid='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
      and role='caregiver'
  ) then raise exception 'New caregiver membership not created'; end if;
  if (select count(*) from public.naknak_caregiver_invites where accepted_at is not null)<>1 then
    raise exception 'Invitation not atomically consumed';
  end if;
end $$;

-- Separate token is revoked, so a different user cannot redeem it.
set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
select invite_token from public.naknak_invite_create('11111111-1111-4111-8111-111111111111') \gset
select set_config('naknak.ci_revoked_token', :'invite_token', false);
select invite_id from public.naknak_invite_list('11111111-1111-4111-8111-111111111111')
  where status='pending' order by created_at desc limit 1 \gset
select public.naknak_invite_revoke(:'invite_id'::uuid);
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
do $$
declare rejected boolean:=false;
begin
  begin perform public.naknak_invite_accept(current_setting('naknak.ci_revoked_token'));
  exception when others then rejected:=true; end;
  if not rejected then raise exception 'Revoked token was accepted'; end if;
end $$;

-- Anonymous callers must not execute privileged invitation RPCs.
reset role;
do $$
begin
  if has_function_privilege('anon','public.naknak_invite_create(uuid)','EXECUTE') then
    raise exception 'Anonymous invite creation permission leaked';
  end if;
end $$;
-- Read-only subscription table: payments cannot be activated by browser users.
\ir ../supabase/migrations/20261031094500_subscription_read_model.sql
insert into public.naknak_family_subscriptions(
  household_id,provider,provider_subscription_id,billing_cycle,status,period_start,period_end
) values
('11111111-1111-4111-8111-111111111111','manual','ci-sub-1','monthly','active',now(),now()+interval '30 days'),
('22222222-2222-4222-8222-222222222222','manual','ci-sub-2','annual','active',now(),now()+interval '365 days');

do $
begin
  if has_table_privilege('authenticated','public.naknak_family_subscriptions','INSERT') or
     has_table_privilege('authenticated','public.naknak_family_subscriptions','UPDATE') or
     has_table_privilege('anon','public.naknak_family_subscriptions','SELECT') or
     not has_table_privilege('authenticated','public.naknak_family_subscriptions','SELECT') then
    raise exception 'Subscription table exposes unsafe client privileges';
  end if;
end $;

set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
do $
declare n integer;
begin
  select count(*) into n from public.naknak_family_subscriptions;
  if n<>1 then raise exception 'Household A could see another household subscription'; end if;
end $;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
do $
declare n integer;
begin
  select count(*) into n from public.naknak_family_subscriptions;
  if n<>1 then raise exception 'Household B could see another household subscription'; end if;
end $;

reset role;
select 'PASS: one-use owner-only invites; subscription SELECT-only access scoped by RLS' as result;
