# NakNak deployment guide

NakNak currently has three deliverables:

- `index.html` — public website
- `dashboard.html` — Supabase-connected Caregiver / Anak dashboard
- `naknak-app.html` — generated Senior / PWD web beta; `app.html` is its stable entry point
- `native/` — Expo iOS/Android project; local-first with optional Family Code status sync

The native sync milestone sends only server-confirmed Ayos Ako and SOS-opened status to the assigned Senior/PWD dashboard record. It does not provide push/SMS alerts, medication/contact sync, location sharing, or fall detection. Do not describe it more broadly until those capabilities and a real two-device test are complete.

## 1. Build and verify the web files

Use the repository's configured Node runtime, then run:

```bash
node scripts/build-web.mjs
node scripts/verify-web.mjs
```

The generated `naknak-app.html` is committed because GitHub Pages serves static files and does not run the build step.

## 2. Supabase production setup

Project ref: `louqshzgqutxydfqgnyz`

For a fresh project, run `naknak_schema.sql`, then apply every ordered file in `supabase/migrations/`. For the existing production project, retain the ordered migrations, including:

1. `20260906180320_protect_payment_plan.sql`
2. `20260906180615_harden_rls_and_indexes.sql`
3. `20260906180928_limit_device_rpcs_to_anon.sql`
4. `20260909082331_add_native_family_sync.sql`
5. `20260909082808_add_device_revocation.sql`

The Caregiver / Anak dashboard signs in with a Supabase magic link and uses RLS-scoped table access. The Senior / PWD web beta pairs with a temporary family code and then uses an opaque device secret through narrowly granted RPC functions.

In Supabase Auth, set the Site URL and allowed redirect URL to the exact production dashboard URL:

```text
https://justineinacay.github.io/Naknak/dashboard.html
https://justineinacay.github.io/Naknak/family-dashboard.html
```

The new Family Dashboard uses `signInWithOtp` with `family-dashboard.html` as its exact redirect target. If only the advanced dashboard URL is allowlisted, magic-link sign-in to the new Family Dashboard will fail. Verify both URLs in Supabase Auth → URL Configuration before publishing.

If a custom domain is introduced, add its exact dashboard URL before changing the public links.

## 3. PayMongo

Follow `PAYMONGO_SETUP.md`. The checkout function requires a signed-in caregiver and verified household membership. Only the signed PayMongo webhook may activate a paid plan.

Required function secrets include:

```text
PAYMONGO_SECRET_KEY
PAYMONGO_WEBHOOK_SECRET
PUBLIC_SITE_URL=https://justineinacay.github.io/Naknak/
ALLOWED_WEB_ORIGINS=https://justineinacay.github.io
```

Never put PayMongo secret or Supabase service-role keys in browser files.

## 4. GitHub Pages

GitHub Pages serves `main` from the repository root. The PWA manifest, service worker, icons, and `.well-known/security.txt` must be committed with the HTML files.

GitHub Pages does not allow repository code to set all production response headers. The DNS and header configuration that needs a custom domain/CDN is documented in `SECURITY.md`.

## 5. Release gates that still require real devices or provider access

- Complete a real two-device test of Family Code pairing, Ayos Ako delivery, SOS-opened delivery, app-side disconnect, and caregiver-side device revocation.
- Test SOS direct calling, notification permissions, reminder delivery, cancellation, and app reset on a physical iPhone.
- Test two real devices for Caregiver / Anak and Senior / PWD synchronization.
- Complete a PayMongo test-mode checkout and signed webhook delivery.
- Verify magic-link redirects using a real mailbox.
- Create an Apple Developer account, App Store Connect record, privacy details, screenshots, TestFlight build, and review submission.

Do not claim SMS, automatic calling, guaranteed push, automatic location sharing, fall detection, or App Store availability before those capabilities are implemented and verified.


## P0–P2 family operations (review before deployment)

The `family-dashboard.html` now includes Connection Center, Daily Care Hub, Family Access, Shared Prep, and Support Center. `index.html` links to `family-dashboard.html#connection`.

The SQL migration `supabase/migrations/20261031090000_household_prep_and_support.sql` has **not been applied to production**. A connected Supabase inspection failed with a read-only database credential error. Have an authorized project administrator review and test its RLS before applying it. Until then, prep uses clearly labeled browser-only drafts; support requests offer email fallback. Review `P0-P2-IMPLEMENTATION.md` for release gates.

Payment, new multi-caregiver invitations, remote push/SMS, native full medication sync, and store releases remain separate unverified development work.


## P0–P1 installation and regression checks

1. Review `P0-P1-IMPLEMENTATION.md` and the invitation/subscription migrations before touching production SQL.
2. Run the temporary PostgreSQL CI job `Caregiver invitation authorization tests`; it checks one-use tokens, owner scope, and subscription read-only RLS.
3. Repair the NakNak Supabase database credential issue (28P01). An ACTIVE_HEALTHY project status does not prove SQL access.
4. Add `family-dashboard.html` to Supabase Auth's allowed redirect URLs and test magic-link sign-in.
5. Verify the Connection Center's selected-member Ayos Ako test using two real devices.
6. Before activating billing, implement full subscription lifecycle, including verified recurring charges, period expiry, renewals, cancellations, refunds, historical session reconciliation, and entitlement tests. The legacy one-time checkout is blocked in this review branch and must not be redeployed as a recurring product.
