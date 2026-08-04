# Security

This document describes NakNak's actual security model as implemented —
what's protected, how, and what genuinely isn't finished yet. The goal is
that nothing here is a surprise to whoever reads this before relying on
it with real family data.

## Reporting a vulnerability

Email **naknak@gmail.com** with details. Please don't open a public
GitHub issue for anything that could let someone access another
household's data — give us a chance to patch it first.

## The two trust models

NakNak has two very different users, so it uses two different access
patterns rather than forcing one compromise on both.

### Caregiver (web dashboard) — real authentication

Caregivers sign in with a Supabase Auth magic link (no password to leak).
Every table read/write is scoped by Postgres **Row Level Security** to
`auth.uid()`, via a `naknak_household_members` join table. This means the
*database itself* refuses to return another household's data — it's not
just the app's UI hiding it. Even a compromised or malicious client
talking directly to Supabase's REST API can't read past this.

### Senior's phone (the app) — no login, by design

A person with vision loss or unfamiliar with smartphones should never
have to complete an email OAuth flow to ask for help. Instead:

1. The caregiver's dashboard generates a 6-character pair code
   (`pair_code`), valid for **48 hours**.
2. The phone redeems that code once, via the `pair_device` RPC function.
3. That function validates the code and hands back a private
   **device_secret** — a 24-byte random value the phone stores locally
   and never displays.
4. From then on, every read (`device_get_state`) and write
   (`device_push_state`) presents that secret. Each function
   independently validates it before touching any data.

The phone has **zero direct table access**. The anon API key alone gets
it nothing — every anon-callable function validates its own secret
first. This is enforced by explicit `revoke`/`grant` statements in
`naknak_schema.sql`, not just by omission.

## What this protects against

- **A guessed or leaked 6-character pair code** is only useful for 48
  hours, and only lets someone *pair a new device* — it cannot read or
  write existing data on its own.
- **A leaked anon API key** (which is public by design in any Supabase
  project — it ships in your client-side JS) grants nothing by itself.
  Every table has RLS `deny by default`; the only paths in are
  authenticated household membership or a valid device secret.
- **Cross-household data leakage** — verified via Postgres RLS, not
  client-side filtering, so it holds even against a malicious or buggy
  client.

## Known gaps — said plainly, not hidden

These are real, current limitations. If you're deploying this for
production use with real families, read this section before you do.

- **No per-device revocation yet.** If a phone is lost, the caregiver
  can regenerate the household's pair code from the dashboard, which
  stops *new* devices from pairing — but the lost phone's existing
  `device_secret` keeps working until it's manually revoked in the
  Supabase table editor (`naknak_devices`). A "revoke this device"
  button in the dashboard is the natural next addition.
- **No rate limiting on `pair_device` beyond Supabase's platform
  defaults.** A script could still brute-force 6-character codes at
  whatever rate Supabase's own abuse protection allows. A dedicated
  limit (e.g., a Postgres function tracking attempts per IP, or an Edge
  Function) is the next hardening step if this app scales.
- **Card/Stripe payments are now webhook-verified** — a `stripe-webhook`
  Supabase Edge Function verifies Stripe's request signature, logs every
  event to `naknak_payment_events` (keyed on Stripe's own event ID, so a
  retried delivery can't double-activate a plan), and only then updates
  the household's plan using the service-role key. The client never
  self-reports a Stripe payment as successful — Stripe tells the server
  directly. **GCash direct-transfer remains self-reported**, stated
  plainly in its own UI, because there's no webhook Supabase can
  subscribe to for a manual bank/e-wallet transfer — that's an inherent
  limitation of that payment method, not something left unfinished. The
  Stripe flow keeps a manual "I paid but it didn't activate" fallback
  for cases where a webhook is delayed or fails to deliver, clearly
  labeled in the UI as unverified.
- **One caregiver = one household owner.** Multiple caregivers sharing
  one household (e.g., two siblings both caring for a parent) isn't
  wired up yet. Adding it is a small schema addition — an
  `invite_caregiver(email)` RPC that inserts into
  `naknak_household_members` — flagged here rather than silently
  missing.
- **This is a security *notice* document, not a security audit.** It
  describes what was deliberately built and tested during development.
  It is not a substitute for an independent penetration test or a
  professional security review before handling real health data at
  scale.

## Practical checklist before going live with real users

- [ ] Confirm `naknak_schema.sql` has been run in full on your Supabase
      project (all tables, RLS policies, and RPC functions).
- [ ] Confirm **Authentication → URL Configuration → Site URL** points
      to your real deployed domain, not `localhost` (see `DEPLOY.md`).
- [ ] Decide on and implement a per-device revocation flow before
      onboarding families who might lose a phone.
- [ ] Decide whether self-reported payment activation is acceptable at
      your current scale, or whether to prioritize the webhook-verified
      version first.
