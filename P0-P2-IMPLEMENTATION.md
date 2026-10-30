# NakNak P0–P2 Implementation Status (review branch)

**Date:** 2026-10-31  
**Scope:** Philippine-first public website, authenticated Family Dashboard, Supabase extension and native safety app.

## Built in this branch

- **P0: Connection Center.** Authenticated account and household membership revalidation; last record update; best-effort paired-device record listing (without reading device secrets); clear state when access is denied; actual instructions for a two-device test; no claim of confirmed physical safety or caregiver notification delivery.
- **P0: Family setup.** New four-step onboarding guidance integrated with the existing secure Family Code screen and current device pairing flow. It does **not** alter the native secret or pairing RPC.
- **P1: Daily Care Hub.** Read-only member check-ins, synchronized historical activity, and any medication schedules available in the household record. Native medication reminders are not currently synced to this panel.
- **P1: Family Access.** Household membership/role verification against `naknak_household_members`; an explicit security gate on caregiver invitations because server-side invitation authorization has not been implemented.
- **P1: Pricing visibility.** Free ₱0 and Family ₱199/month or ₱1,990/year remain proposals. Do **not** activate paid plans client-side; use only a verified payment webhook. Billing provider tests remain outstanding.
- **P2: Preparedness checklist.** Eight nonmedical household items. When the reviewed SQL migration is applied and RLS is configured, authenticated members may share and edit checklist completion. Otherwise, users get clearly labeled *browser-only drafts*, with no false remote-sync acknowledgement.
- **P2: Support requests.** Authenticated household-scoped ticket submissions and ticket history when the RLS migration is applied. When absent, display a real email fallback; never pretend a support ticket was stored. This is not an emergency service.
- **P2: Release requirements.** Visible device-testing and app-store gates in Support Center. This is a readiness checklist, not an App Store release.

## Not built / not activated

- Remote push/SMS, automatic calling, continuous location sharing, fall detection and guaranteed alert delivery.
- Multi-caregiver invite acceptance, role changes, and full multi-actor authorization workflow.
- Backend synchronization of native medicine schedules, local documents, or private medical IDs.
- New SQL tables in **production**: connected Supabase database inspection failed with `password authentication failed for user supabase_read_only_user`. No live migration has been applied.
- PayMongo production billing, subscription management, renewal/cancellation webhooks, entitlement checks, and real card/GCash tests.
- Support staff/admin triage interface, real iOS/Android binaries, device lab tests or store approval.

## Required release checks

1. Review `supabase/migrations/20261031090000_household_prep_and_support.sql` with the project DBA; ensure `naknak_household_members` RLS is active and test cross-household denial. Only after the SQL is approved, apply to a test environment before production.
2. Verify a signed-in caregiver can read/write prep items **only** for their household; a signed-out user, another household, and a forged `updated_by` must be rejected. Verify that support tickets are visible only to their requester and client-side status updates are denied.
3. Verify an actual two-device native app pairing, Ayos Ako event, SOS-opened event, network loss, reconnect, device revocation, and return to the dashboard; document latency, lost signals and failures.
4. Verify local preview without credentials shows no real household records and does not claim secure sync.
5. Test desktop/mobile navigation, input validations and screen-reader announcements; test reduced motion.
6. Confirm payment webhook receives authenticated provider events before *any* premium entitlement is granted; verify annual/monthly renewals and cancellations.
7. Test physical iOS/Android SOS dialing and medication reminders under low battery, denied notification permissions and offline conditions. App Store submission only after listing, disclosures, signing and store approval.

## Operational note

NakNak is a household support application, **not emergency dispatch**. A stale timestamp means only that the last confirmed record is old; it is not a health assessment. Neither SOS-opened nor a successful HTTP write proves that another person saw an alert.

## GitHub Pages deployment

`index.html` links to `family-dashboard.html#connection`. The new sections are in the existing Family Dashboard, not a disconnected demo. Review the pull request and CI before merge. Database migration deployment and paid subscriptions are separate approval gates.
