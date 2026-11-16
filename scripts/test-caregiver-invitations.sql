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
-- Mirror the production membership SELECT grant/RLS used by household-scoped policies.
alter table public.naknak_household_members enable row level security;
grant select on table public.naknak_household_members to authenticated;
create policy "member can read own membership" on public.naknak_household_members
  for select to authenticated using (auth_uid = (select auth.uid()));
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

do $$
begin
  if has_table_privilege('authenticated','public.naknak_family_subscriptions','INSERT') or
     has_table_privilege('authenticated','public.naknak_family_subscriptions','UPDATE') or
     has_table_privilege('anon','public.naknak_family_subscriptions','SELECT') or
     not has_table_privilege('authenticated','public.naknak_family_subscriptions','SELECT') then
    raise exception 'Subscription table exposes unsafe client privileges';
  end if;
end $$;

set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
do $$
declare n integer;
begin
  select count(*) into n from public.naknak_family_subscriptions;
  if n<>1 then raise exception 'Household A could see another household subscription'; end if;
end $$;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
do $$
declare n integer;
begin
  select count(*) into n from public.naknak_family_subscriptions;
  if n<>1 then raise exception 'Household B could see another household subscription'; end if;
end $$;

reset role;

-- P0: native idempotent receipt and device bearer-secret privacy tests.
create table public.naknak_devices (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.naknak_households(id),
  device_secret text not null unique,
  device_label text,senior_id text,
  paired_at timestamptz default now(),last_seen_at timestamptz default now()
);
create table public.naknak_state (
  household_id uuid primary key references public.naknak_households(id),
  rev bigint not null default 0
);
insert into public.naknak_state(household_id) values
('11111111-1111-4111-8111-111111111111');
insert into public.naknak_devices(household_id,device_secret,senior_id)
values
('11111111-1111-4111-8111-111111111111',repeat('a',48),'alice');

grant select on public.naknak_devices to authenticated;
create or replace function public.native_device_report(
  p_secret text,p_event text,p_client_time timestamptz default now()
) returns table(delivered boolean,rev bigint)
language plpgsql security definer set search_path='' as $$
declare v_rev bigint;
begin
  update public.naknak_state set rev=naknak_state.rev+1
    where household_id=(select household_id from public.naknak_devices where device_secret=p_secret)
    returning naknak_state.rev into v_rev;
  if v_rev is null then raise exception 'Bad credential'; end if;
  return query select true,v_rev;
end $$;
revoke all on function public.native_device_report(text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.native_device_report(text,text,timestamptz) to anon;
\ir ../supabase/migrations/20261116090000_native_outbox_event_receipts.sql

do $$
begin
  if has_column_privilege('authenticated','public.naknak_devices','device_secret','SELECT') then
    raise exception 'Device secret is readable by caregiver';
  end if;
  if not has_column_privilege('authenticated','public.naknak_devices','device_label','SELECT') then
    raise exception 'Device metadata should remain readable';
  end if;
  if has_table_privilege('anon','public.naknak_native_event_receipts','SELECT') then
    raise exception 'Anonymous receipts are exposed';
  end if;
  if has_function_privilege('authenticated','public.native_device_report_once(text,text,text)','EXECUTE') then
    raise exception 'Authenticated users must not call device-secret report API';
  end if;
end $$;

set role anon;
select delivered,duplicate,rev from public.native_device_report_once(
  repeat('a',48),'check_in_ok','event-1700000000000-abc123'
);
select delivered,duplicate,rev from public.native_device_report_once(
  repeat('a',48),'check_in_ok','event-1700000000000-abc123'
);
reset role;
do $$
declare c bigint;
begin
  select rev into c from public.naknak_state
    where household_id='11111111-1111-4111-8111-111111111111';
  if c<>1 then raise exception 'Duplicate report incremented revision'; end if;
  if (select count(*) from public.naknak_native_event_receipts)<>1 then
    raise exception 'Duplicate event created a second receipt';
  end if;
end $$;

set role anon;
do $$
declare denied boolean:=false;
begin
  begin
    perform public.native_device_report_once(
      repeat('b',48),'check_in_ok','event-1700000000001-abc123'
    );
  exception when others then denied:=true; end;
  if not denied then raise exception 'Invalid device credential accepted'; end if;
end $$;
reset role;

select 'PASS: caregiver invitations, subscription RLS, private device secrets and idempotent event receipts' as result;



-- P0 pairing: cryptographic code, 30-minute expiry and no fake initial "OK".
alter table public.naknak_households
  add column pair_code text,
  add column pair_code_expires_at timestamptz,
  add column max_devices integer default 4,
  add column created_by uuid references auth.users(id);
alter table public.naknak_households alter column id set default pg_catalog.gen_random_uuid();
-- Match production household/state read grants and RLS for test actors.
alter table public.naknak_households enable row level security;
grant select on public.naknak_households to authenticated;
create policy "member can read household in test" on public.naknak_households
 for select to authenticated using (id in
   (select household_id from public.naknak_household_members
    where auth_uid=(select auth.uid())));
alter table public.naknak_state enable row level security;
grant select on public.naknak_state to authenticated;
create policy "member can read state in test" on public.naknak_state
 for select to authenticated using (household_id in
   (select household_id from public.naknak_household_members
    where auth_uid=(select auth.uid())));

alter table public.naknak_state add column state jsonb not null default '{}'::jsonb;
\ir ../supabase/migrations/20261116092000_secure_short_lived_family_codes.sql

set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
select household_id,pair_code from public.create_household('Test Family Member') \gset
select set_config('naknak.ci_new_hh',:'household_id',false);
do $audit$
declare
  v_code text;
  v_expiry timestamptz;
  v_profile jsonb;
begin
  select h.pair_code,h.pair_code_expires_at into v_code,v_expiry
    from public.naknak_households h where h.id=current_setting('naknak.ci_new_hh')::uuid;
  select state->'seniors'->0 into v_profile
    from public.naknak_state where household_id=current_setting('naknak.ci_new_hh')::uuid;
  if length(v_code)<>6 or v_code !~ '^[A-Z2-9]{6}$' then
    raise exception 'Family Code format invalid';
  end if;
  if v_expiry>now()+interval '35 minutes' or v_expiry<now() then
    raise exception 'Family Code has unexpected expiry';
  end if;
  if v_profile->>'status'<>'unknown' or v_profile->>'battery' is not null
     or jsonb_array_length(v_profile->'eventLog')<>0 then
    raise exception 'New household starts with fake safety or check-in data';
  end if;
end $audit$;
select set_config('naknak.ci_old_code',:'pair_code',false);
select public.regenerate_pair_code(current_setting('naknak.ci_new_hh')::uuid);
do $audit$
begin
  if (select pair_code from public.naknak_households where id=current_setting('naknak.ci_new_hh')::uuid)
       = current_setting('naknak.ci_old_code') then
    raise exception 'Pair code rotation reused old code';
  end if;
end $audit$;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
do $audit$
declare denied boolean:=false;
begin
  begin
    perform public.regenerate_pair_code(current_setting('naknak.ci_new_hh')::uuid);
  exception when others then denied:=true; end;
  if not denied then raise exception 'Non-owner rotated another household code'; end if;
end $audit$;
reset role;
select 'PASS: pairing entropy/expiry, owner rotation, and honest unknown initial state' as result;


-- Privacy requests: a signed-in user may submit only for their households.
\ir ../supabase/migrations/20261116094000_privacy_rights_requests.sql
set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
insert into public.naknak_data_rights_requests(requester_id,household_id,request_type,note)
values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','export','Please provide a copy.');
do $audit$
declare denied boolean:=false;
begin
  begin
    insert into public.naknak_data_rights_requests(requester_id,household_id,request_type,note)
    values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '22222222-2222-4222-8222-222222222222','delete_household','Unauthorized attempt');
  exception when others then denied:=true; end;
  if not denied then raise exception 'Cross-household privacy request permitted'; end if;
end $audit$;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
do $audit$
begin
  if (select count(*) from public.naknak_data_rights_requests)<>0 then
    raise exception 'Another user can see the request';
  end if;
  if has_table_privilege('authenticated','public.naknak_data_rights_requests','UPDATE') then
    raise exception 'User could self-mark request as completed';
  end if;
end $audit$;
reset role;
select 'PASS: RLS privacy intake authorizes own household only' as result;
