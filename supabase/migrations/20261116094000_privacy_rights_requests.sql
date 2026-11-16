-- NakNak privacy rights intake: staging migration only.
-- Request submission is NOT account deletion or medical-record deletion.
-- Staff fulfillment must separately verify authority, data retention law,
-- related household members and service-provider records.

create table if not exists public.naknak_data_rights_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references public.naknak_households(id) on delete set null,
  request_type text not null check (request_type in (
    'access','export','correction','delete_account','delete_household'
  )),
  note text not null default '' check(char_length(note)<=1200),
  status text not null default 'received' check (status in (
    'received','verifying','in_review','completed','declined'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists naknak_data_rights_requester_idx
  on public.naknak_data_rights_requests(requester_id,created_at desc);
alter table public.naknak_data_rights_requests enable row level security;
revoke all on public.naknak_data_rights_requests from public,anon,authenticated;
grant select,insert on public.naknak_data_rights_requests to authenticated;

drop policy if exists "naknak rights view own" on public.naknak_data_rights_requests;
create policy "naknak rights view own" on public.naknak_data_rights_requests
for select to authenticated
using (requester_id=(select auth.uid()));

drop policy if exists "naknak rights submit self" on public.naknak_data_rights_requests;
create policy "naknak rights submit self" on public.naknak_data_rights_requests
for insert to authenticated with check (
  requester_id=(select auth.uid())
  and status='received'
  and (
    household_id is null or household_id in (
      select m.household_id from public.naknak_household_members m
        where m.auth_uid=(select auth.uid())
    )
  )
);

-- No client UPDATE/DELETE grant: submitted requests cannot mark
-- themselves "completed" or erase evidence of a pending request.
-- Administrative fulfillment is intentionally a separate audited process.
