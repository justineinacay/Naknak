-- P0 reliability & credential exposure reduction; STAGING REVIEW REQUIRED
-- After this is deployed, native clients must use native_device_report_once.
-- Existing native_device_report remains temporarily available for older clients;
-- its removal is a separate versioned compatibility decision.
--
-- Device credentials are bearer secrets, NOT caregiver-readable data.
-- Always test the existing dashboard's explicitly selected device columns
-- before applying this migration to production.

alter table public.naknak_devices enable row level security;
revoke all on public.naknak_devices from anon,authenticated,public;
grant select (
  id, household_id, device_label, senior_id, paired_at, last_seen_at
) on public.naknak_devices to authenticated;

-- A durable, private receipt for idempotent app-to-server event transmission.
create table if not exists public.naknak_native_event_receipts (
  device_id uuid not null references public.naknak_devices(id) on delete cascade,
  client_event_id text not null check (client_event_id ~ '^[a-zA-Z0-9_-]{10,96}$'),
  event_type text not null check (event_type in ('check_in_ok','sos_opened')),
  server_received_at timestamptz not null default now(),
  revision bigint not null,
  primary key(device_id,client_event_id)
);
create index if not exists naknak_native_event_receipts_received_idx
  on public.naknak_native_event_receipts(server_received_at);
alter table public.naknak_native_event_receipts enable row level security;
revoke all on table public.naknak_native_event_receipts from public,anon,authenticated;

-- Note the trust boundary: the phone supplies a device bearer credential,
-- not a user JWT. This SECURITY DEFINER RPC validates the credential,
-- serializes reports for that device, and returns only its own receipt.
create or replace function public.native_device_report_once(
  p_secret text, p_event text, p_event_id text
) returns table(
  delivered boolean,duplicate boolean,server_received_at timestamptz,rev bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_device_id uuid;
  v_prior public.naknak_native_event_receipts%rowtype;
  v_report record;
  v_received_at timestamptz;
begin
  if p_event not in ('check_in_ok','sos_opened') then
    raise exception 'Unsupported event';
  end if;
  if p_event_id is null or p_event_id !~ '^[a-zA-Z0-9_-]{10,96}$' then
    raise exception 'Invalid event identifier';
  end if;
  if p_secret is null or length(p_secret) <> 48 then
    raise exception 'Invalid device credential';
  end if;

  -- Prevent concurrent reports from this device racing to insert receipts.
  select d.id into v_device_id
    from public.naknak_devices d
    where d.device_secret = p_secret
    for update;
  if v_device_id is null then
    raise exception 'Device is not paired or has been revoked';
  end if;

  select * into v_prior from public.naknak_native_event_receipts r
    where r.device_id=v_device_id and r.client_event_id=p_event_id;
  if found then
    if v_prior.event_type <> p_event then
      raise exception 'Identifier used with another event type';
    end if;
    return query select true,true,v_prior.server_received_at,v_prior.revision;
    return;
  end if;

  -- The legacy function safely appends a recorded Ayos Ako/SOS-opened entry
  -- to its paired member only. Use NOW() as authoritative server receipt
  -- instead of trusting a phone's potentially incorrect clock.
  select r.delivered, r.rev into v_report
    from public.native_device_report(p_secret,p_event,now()) as r;
  if not coalesce(v_report.delivered,false) then
    raise exception 'Event was not accepted by the server';
  end if;

  v_received_at := now();
  insert into public.naknak_native_event_receipts(
    device_id,client_event_id,event_type,server_received_at,revision
  ) values (
    v_device_id,p_event_id,p_event,v_received_at,v_report.rev
  );
  return query select true,false,v_received_at,v_report.rev;
end;
$$;

revoke all on function public.native_device_report_once(text,text,text)
  from public,anon,authenticated;
grant execute on function public.native_device_report_once(text,text,text) to anon;

-- The RPC grants do NOT imply that a server receipt delivered a remote push
-- to caregivers. A future notification subsystem must have its own receipts.
