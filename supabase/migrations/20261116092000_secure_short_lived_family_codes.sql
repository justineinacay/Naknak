-- P0 pairing hardening: short-lived cryptographic Family Codes.
-- Existing codes are not immediately invalidated by this migration.
-- A later rotation lets every active household use the stronger format.
alter table public.naknak_households
  alter column pair_code_expires_at set default (now() + interval '30 minutes');

create or replace function public.naknak_generate_pair_code()
returns text
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_bytes bytea := extensions.gen_random_bytes(6);
  v_charset text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_result text := '';
  v_i integer;
begin
  for v_i in 0..5 loop
    v_result := v_result || substr(v_charset, 1+(get_byte(v_bytes,v_i)%32),1);
  end loop;
  return v_result;
end;
$$;
revoke all on function public.naknak_generate_pair_code()
  from public,anon,authenticated;

-- All new Family Spaces start in UNKNOWN status; a newly created profile
-- must never imply a real check-in, an actual battery reading or safety.
create or replace function public.create_household(p_senior_name text default 'Senior')
returns table(household_id uuid,pair_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_hh_id uuid;
  v_senior jsonb;
  v_name text;
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in is required';
  end if;
  v_name := left(coalesce(nullif(btrim(p_senior_name),''),'Family member'),60);
  v_code := public.naknak_generate_pair_code();
  insert into public.naknak_households(pair_code,created_by,pair_code_expires_at)
  values(v_code,(select auth.uid()),now()+interval '30 minutes')
  returning id into v_hh_id;
  insert into public.naknak_household_members(household_id,auth_uid,role)
  values(v_hh_id,(select auth.uid()),'owner');

  v_senior := jsonb_build_object(
    'id',pg_catalog.gen_random_uuid()::text,
    'name',v_name,'nickname',split_part(v_name,' ',1),
    'battery',null,'status','unknown','location','',
    'lastCheckin',null,'checkedIn',false,'gpsLocation',null,
    'medicalProfile',jsonb_build_object(
      'bloodType','','allergies','[]'::jsonb,'conditions','[]'::jsonb,
      'doctorName','','doctorNum','','philhealth','','notes',''
    ),
    'eventLog','[]'::jsonb,'contacts','[]'::jsonb,
    'medications','[]'::jsonb,'vitals','[]'::jsonb,
    'safeZone',null,'notes','[]'::jsonb,'vault','[]'::jsonb,'goBag','{}'::jsonb
  );
  insert into public.naknak_state(household_id,state,rev)
  values(
    v_hh_id,
    jsonb_build_object('seniors',jsonb_build_array(v_senior),'plan','free',
      'activeSeniorId',v_senior->>'id','alerts','[]'::jsonb),
    (extract(epoch from clock_timestamp())*1000)::bigint
  );
  return query select v_hh_id,v_code;
end;
$$;
revoke all on function public.create_household(text) from public,anon,authenticated;
grant execute on function public.create_household(text) to authenticated;

create or replace function public.regenerate_pair_code(p_household_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.naknak_household_members m
    where m.household_id=p_household_id
      and m.auth_uid=(select auth.uid()) and m.role='owner'
  ) then
    raise exception 'Only the Family Space owner can rotate its code';
  end if;
  v_code := public.naknak_generate_pair_code();
  update public.naknak_households
    set pair_code=v_code,pair_code_expires_at=now()+interval '30 minutes'
    where id=p_household_id;
  if not found then raise exception 'Family Space not found'; end if;
  return v_code;
end;
$$;
revoke all on function public.regenerate_pair_code(uuid) from public,anon,authenticated;
grant execute on function public.regenerate_pair_code(uuid) to authenticated;

-- Rate-limit anonymous failed code guesses at the Supabase API/Edge layer.
-- Code entropy & expiry complement, not replace, trusted origin-based limits.
