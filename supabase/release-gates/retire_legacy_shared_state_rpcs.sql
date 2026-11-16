-- MANUAL CUTOVER ONLY — DO NOT RUN with active legacy PWA clients.
-- The older web beta uses a bearer key to read/replace the entire shared
-- household JSON state. Once web clients are migrated to scoped endpoints,
-- an authorized project DBA should retire these RPCs in a staged rollout.
-- This file is intentionally outside supabase/migrations so it is NOT
-- applied automatically as part of the P0 migration sequence.

revoke execute on function public.device_get_state(text) from anon;
revoke execute on function public.device_push_state(text,jsonb,bigint) from anon;
revoke execute on function public.pair_device(text,text) from anon;

-- Validate the API responds with authorization errors to old bearer-only
-- calls; confirm new native get_status/report_once/pair_native_device work.
-- Audit PUBLIC/other inherited grants before considering this complete.
