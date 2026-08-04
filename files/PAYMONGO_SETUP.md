# PayMongo payment setup

## 0. Unpause your Supabase project first — do this before anything else

Last checked directly, your project's status came back **`INACTIVE`**.
That means sign-in, sync, and every read/write in your live app is down
right now for any real user, not just this integration. This is almost
certainly Supabase's free-tier auto-pause after a period of inactivity.

**Fix:** go to [supabase.com/dashboard](https://supabase.com/dashboard),
open the NakNak project, and restore it if it shows as paused. Nothing
below this step will work until it's active again — and it's worth
checking again now, since time has passed since it was last confirmed
paused.

## 1. Run the database migration

Once your project is active, open the Supabase **SQL Editor** and run
`naknak_payment_events_migration.sql` (also already folded into the
bottom of `naknak_schema.sql`, if you're setting up fresh). This
creates the audit table both functions below write to.

## 2. Why two Edge Functions, not a simple payment link

PayMongo's no-code Payment Links don't have a confirmed, reliable way
to carry a per-customer reference (the way Stripe's `client_reference_id`
URL parameter does). PayMongo's **Checkout Sessions**, created through
their API, do support custom `metadata` — confirmed directly against
PayMongo's own webhook payload examples. So instead of one static
link, there are two small functions:

- **`create-checkout-session`** — called by `dashboard.html` when a
  caregiver clicks "Bayaran Ngayon." Creates a PayMongo Checkout
  Session server-side (so your secret key never touches the browser),
  attaching the household ID and plan as metadata.
- **`paymongo-webhook`** — PayMongo calls this directly (never the
  browser) once payment is confirmed. Verifies PayMongo's signature,
  reads the metadata back, and activates the plan.

## 3. Set your secrets in Supabase — never in this chat

Go to **Supabase Dashboard → Edge Functions → (each function) →
Secrets**, or via the CLI:
```
supabase secrets set PAYMONGO_SECRET_KEY=sk_... --project-ref louqshzgqutxydfqgnyz
supabase secrets set PAYMONGO_WEBHOOK_SECRET=whsk_... --project-ref louqshzgqutxydfqgnyz
```
- `PAYMONGO_SECRET_KEY` — PayMongo Dashboard → Developers → API keys
  (the **secret** key).
- `PAYMONGO_WEBHOOK_SECRET` — you'll get this in step 5, when you
  create the webhook in PayMongo's dashboard (format `whsk_...`).

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to every
Edge Function automatically.

## 4. Deploy both functions

```
supabase functions deploy create-checkout-session --project-ref louqshzgqutxydfqgnyz
supabase functions deploy paymongo-webhook --project-ref louqshzgqutxydfqgnyz --no-verify-jwt
```
The `--no-verify-jwt` on the webhook matters — PayMongo calling it
won't carry a Supabase login token, only its own signature.

## 5. Register the webhook in PayMongo

PayMongo Dashboard → **Developers → Webhooks → Create**:
- URL: `https://louqshzgqutxydfqgnyz.supabase.co/functions/v1/paymongo-webhook`
- Event to send: `checkout_session.payment.paid`
- Copy the resulting `secret_key` (`whsk_...`) into step 3 above.

## 6. Test it

PayMongo's dashboard lets you send a test event to your webhook
endpoint — use it to confirm your function returns `200`. For a full
test with real test-mode payment methods, use PayMongo's test card
numbers before going live.

## What happens once this is wired up

A caregiver clicks "Bayaran Ngayon" → `create-checkout-session` opens a
real PayMongo checkout with their household ID attached → they pay →
PayMongo calls `paymongo-webhook` directly → the function verifies the
signature, logs the event, and activates the plan → the dashboard's
existing realtime sync picks up the change automatically. The old
"I've paid, activate me" button still exists, but only as a clearly
labeled fallback for a delayed or failed webhook — not the primary
path anymore.
