# NakNak P0–P1 Build & Release Verification

**Review scope:** 2026-10-31 • Philippines-first household safety app  
**Branch:** `feature/naknak-p0-p2-family-operations-20261031` • **Not deployed to production**

## P0 — Family Setup, Reliability and Safety

- Existing secure sign-in and Family Code onboarding remain in place.
- Family Dashboard now supports authenticated **multiple household membership** and switching. Household selection comes only from `naknak_household_members` scoped to the signed-in account.
- **Connection Center** distinguishes browser network, signed-in account, server-verified membership, last successful server read and the time of the household record's last change.
- An out-of-date/failed read displays a persistent visible warning. An SOS-opened record does **not** claim caregiver notification, automatic emergency dispatch, or physical safety.
- **Ayos Ako two-device verification:** select the intended member, capture a server baseline, send a check-in on the paired phone, and explicitly verify a new event on the server. A new record is *not* proof someone received a push/SMS.
- Return to an existing dashboard section through `family-dashboard.html#connection` and other section deep links.
- Existing app and backend continue to support native Ayos Ako and SOS-opened reports only. New remote notification delivery is **not** implemented.

### P0 physical test (required)

1. Create a test household and one test member on the HTTPS Family Dashboard.
2. Pair an actual iPhone/Android NakNak app via the Family Code. Confirm the phone receives the assigned member and stores its opaque device credential.
3. Select that member in Connection Center and start the Ayos Ako verification test.
4. Send Ayos Ako from the phone; confirm the phone reports server success; use Verify in the dashboard.
5. Repeat with temporary offline state and record the actual error and recovery behavior.
6. Open SOS in a **test-only** environment without contacting real emergency dispatch; confirm `sos_opened` event and dashboard label, not automatic alert delivery.
7. Revoke the device, confirm further server reports are rejected and existing credentials are not accepted.
8. Test another family's account attempting to read the household state; access must be rejected.
9. Repeat on small phones and desktop. Check accessibility scaling and denied notification permissions.

**Status:** Code checks pass. Physical-device / live sign-in and sync tests are not yet verified.

## P1 — Daily Care, Household Access, Plans

- **Daily Care Hub** shows available server records only: member check-in times, chronological activity, medication information if present, and a seven-day count of recorded check-ins/SOS-opened events. It never converts missing data into adherence or safety conclusions. Native medications remain on the phone unless a separate consented sync is built.
- **Caregiver invitations:** Staged migration `20261031093000_secure_caregiver_invitations.sql` creates owner-only RPCs for a **one-use, 192-bit random, 24-hour invitation token**, stored as a hash, with owner revocation. Authenticated recipients redeem the token in the Family Dashboard. No token is sent in a URL or stored in browser localStorage. Invite management is disabled if the backend migration is missing.
- **Household access:** Owners can issue/revoke staged invitations; new members receive caregiver role only. Fine-grained medical-profile visibility, role editing, and email delivery of invitations are **not yet implemented**. A caregiver should not be invited without the household's consent to share records.
- **Billing:** The Family Dashboard reads the staged `naknak_family_subscriptions` table for time-bounded periods when deployed, and does not allow client-side entitlement activation. Proposed Free ₱0 / Family ₱199/month or ₱1,990/year prices are not live billing.
- **Legacy checkout protection:** The old one-time PayMongo Checkout Session cannot safely implement a recurring Family subscription. The review branch disables new checkout through the Edge Function and removes new purchase actions from the legacy dashboard. Previously issued payment sessions and customers require reconciliation; the **existing webhook must be audited before production billing**.

### P1 database tests

The GitHub Actions workflow provisions a disposable PostgreSQL 16 database and runs `scripts/test-caregiver-invitations.sql`.

This verifies:
- owner-only invite creation and inability to create invitations for another household;
- hash-only token storage and no direct table privileges for browser roles;
- a valid invite is accepted once and adds a caregiver membership;
- consumed and revoked invitations cannot be reused;
- the subscription period table allows SELECT only for an authenticated member's own household, and denies client INSERT/UPDATE.

**These tests do not replace Supabase's production RLS or magic-link tests.** Supabase-specific Auth and webhook behavior must be verified using a staging project.

## Required integrations before a paid launch

- **Supabase database access:** The connected NakNak project was `ACTIVE_HEALTHY`, but both table introspection and SQL queries failed with `28P01 password authentication failed`. A project owner must repair database access before staged migrations can be tested/applied.
- **Review migrations:** `20261031090000_household_prep_and_support.sql` (prior P2 work), `20261031093000_secure_caregiver_invitations.sql` and `20261031094500_subscription_read_model.sql`. Apply only after staging and explicit security review.
- **Auth redirects:** Allow both `https://justineinacay.github.io/Naknak/dashboard.html` and `https://justineinacay.github.io/Naknak/family-dashboard.html` in Supabase Auth URL configuration.
- **Billing lifecycle:** Implement PayMongo recurring subscriptions (or another confirmed provider), verified payment/renewal/refund/cancellation events, reconciliation, expiration, subscription status handling, and iOS/Android in-app billing compliance. Never grant Family access from a browser return URL or a single one-time payment mislabeled monthly.
- **Native app:** Update Expo patch versions, test on actual Android/iOS devices, prepare store signing, privacy disclosures, accessibility, and releases.
- **Emergencies:** Remote caregiver push/SMS, automatic calls, location sharing and fall detection remain out of scope and must not be advertised as operational.

## Deployment safety

- The current PR is a **draft** and does not alter the live GitHub Pages site or deployed Supabase Edge Functions.
- Merge only after review. Deploying `index.html` and `family-dashboard.html` does **not** deploy Supabase migrations or Edge Functions.
- Keep the payment function blocked until a complete subscription lifecycle exists. Existing PayMongo sessions/webhook events must be reconciled before changing live billing.
