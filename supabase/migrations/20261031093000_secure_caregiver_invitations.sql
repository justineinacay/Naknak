-- NakNak P1: caregiver invitations, one-use and scoped to household owners.
-- REVIEW ONLY: do not apply to production until RLS and cross-household tests pass.
-- Existing tables: public.naknak_households, public.naknak_household_members.
-- The invitation token is 192-bit random hex, shown only at creation, hashed at rest.
-- Tokens are never URLs, user metadata, device secrets or emergency pairing codes.

create table if not exists public.naknak_caregiver_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.naknak_households(id) on delete cascade,
  issued_by uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  role text not null default 'caregiver' check (role = 'caregiver'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  constraint naknak_invite_accepted_together check ((accepted_by is null) = (accepted_at is null))
);
create index if not exists naknak_caregiver_invites_household_idx on public.naknak_caregiver_invites(household_id, created_at desc);
alter table public.naknak_caregiver_invites enable row level security;
-- No direct table policies: all access is via the narrowly validated RPCs.
revoke all on table public.naknak_caregiver_invites from public, anon, authenticated;

create or replace function public.naknak_invite_create(p_household_id uuid)
returns table(invite_token text,expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_token text;
  v_expiry timestamptz;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;

  if not exists (
    select 1 from public.naknak_household_members m
    where m.household_id = p_household_id and m.auth_uid = v_uid and m.role = 'owner'
  ) then raise exception 'Only the household owner may create caregiver invitations'; end if;

  -- Limit outstanding tokens, even if a user repeatedly clicks Invite.
  if (select count(*) from public.naknak_caregiver_invites i
      where i.household_id=p_household_id and i.expires_at>now()
        and i.accepted_at is null and i.revoked_at is null) >= 8 then
    raise exception 'Too many pending invitations; revoke one or try again later';
  end if;

  v_token := encode(extensions.gen_random_bytes(24),'hex');
  v_expiry := now() + interval '24 hours';
  insert into public.naknak_caregiver_invites(household_id,issued_by,token_hash,expires_at)
  values(p_household_id,v_uid,encode(extensions.digest(v_token,'sha256'),'hex'),v_expiry);
  return query select v_token,v_expiry;
end;
$$;

create or replace function public.naknak_invite_accept(p_token text)
returns table(household_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_token text := lower(btrim(coalesce(p_token,'')));
  v_row public.naknak_caregiver_invites%rowtype;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  if v_token !~ '^[a-f0-9]{48}$' then raise exception 'Invalid or expired invitation'; end if;

  select * into v_row from public.naknak_caregiver_invites i
  where i.token_hash = encode(extensions.digest(v_token,'sha256'),'hex')
    and i.expires_at > now() and i.accepted_at is null and i.revoked_at is null
  for update;
  if not found then raise exception 'Invalid or expired invitation'; end if;

  if exists (
    select 1 from public.naknak_household_members m
    where m.household_id=v_row.household_id and m.auth_uid=v_uid
  ) then raise exception 'You already belong to this Family Space'; end if;

  insert into public.naknak_household_members(household_id,auth_uid,role)
  values(v_row.household_id,v_uid,'caregiver');
  update public.naknak_caregiver_invites
    set accepted_by=v_uid,accepted_at=now() where id=v_row.id;
  return query select v_row.household_id;
end;
$$;

create or replace function public.naknak_invite_list(p_household_id uuid)
returns table(invite_id uuid,created_at timestamptz,expires_at timestamptz,status text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
     or not exists (
       select 1 from public.naknak_household_members m
       where m.household_id=p_household_id and m.auth_uid=(select auth.uid()) and m.role='owner'
     ) then raise exception 'Only the household owner can view invitations'; end if;

  return query select i.id,i.created_at,i.expires_at,
    case when i.revoked_at is not null then 'revoked'
         when i.accepted_at is not null then 'accepted'
         when i.expires_at <= now() then 'expired'
         else 'pending' end
  from public.naknak_caregiver_invites i
  where i.household_id=p_household_id
  order by i.created_at desc limit 30;
end;
$$;

create or replace function public.naknak_invite_revoke(p_invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_household_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Sign in required'; end if;

  select i.household_id into v_household_id
  from public.naknak_caregiver_invites i where i.id=p_invite_id;
  if v_household_id is null then return false; end if;

  if not exists (
    select 1 from public.naknak_household_members m
    where m.household_id=v_household_id and m.auth_uid=(select auth.uid()) and m.role='owner'
  ) then raise exception 'Only the household owner can revoke invitations'; end if;

  update public.naknak_caregiver_invites
    set revoked_at=now() where id=p_invite_id and accepted_at is null and revoked_at is null;
  return found;
end;
$$;

-- Supabase grants PUBLIC execute by default; remove explicitly.
revoke all on function public.naknak_invite_create(uuid) from public, anon, authenticated;
revoke all on function public.naknak_invite_accept(text) from public, anon, authenticated;
revoke all on function public.naknak_invite_list(uuid) from public, anon, authenticated;
revoke all on function public.naknak_invite_revoke(uuid) from public, anon, authenticated;
grant execute on function public.naknak_invite_create(uuid) to authenticated;
grant execute on function public.naknak_invite_accept(text) to authenticated;
grant execute on function public.naknak_invite_list(uuid) to authenticated;
grant execute on function public.naknak_invite_revoke(uuid) to authenticated;

-- These SECURITY DEFINER RPCs are justified because direct table access
-- is denied. Every RPC checks auth.uid() AND member-owner authorization
-- (or validates the one-time 192-bit secret for acceptance). Before deploying,
-- run cross-household and unauthorized-actor tests in a staging database.
