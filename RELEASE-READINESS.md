# NakNak — Release Readiness & Integration Runbook
**Updated: 16 November 2026 • REVIEW BRANCH ONLY • NOT A PRODUCTION CERTIFICATION**

## The critical deployment dependency
The native code in this branch sends `native_device_report_once`. Do **not** release a native build or merge this branch into an automatic release until the backend migration creating that RPC is applied and its two-device acceptance tests pass. No legacy fallback was added: duplicate/unchecked delivery must fail clearly rather than silently claim success.

## Current evidence
- GitHub `main` contains public website + Family-First Dashboard; PR #13 adds proposed safety, family, privacy, billing and PWA work.
- Supabase project `louqshzgqutxydfqgnyz` reports healthy, but read/list/SQL operations return `28P01` database authentication failure. **No reviewed migration from this branch was applied**.
- The repository has a temporary PostgreSQL test with RLS, token and event replay cases. This does not replace live Supabase configuration or a real device test.
- Native Expo Doctor fails the SDK 57 patch version check (independent from TypeScript/lint).
- The PayMongo functions in this review branch fail closed for new one-time checkout and log legacy signed webhook events for reconciliation, without activating a recurring plan. Production function deployments have not been touched.
- There is no verified caregiver push/SMS, guaranteed emergency dispatch, continuous GPS sharing or fall detection.

## P0 launch gates (all must pass before connected safety beta)
- [ ] Repair Supabase database administrative access; verify migration history and back up production first.
- [ ] Create **separate staging Supabase project**; never run integration fixtures against real families.
- [ ] Apply existing migrations in order to staging, then review:
  1. `20261031090000_household_prep_and_support.sql`
  2. `20261031093000_secure_caregiver_invitations.sql`
  3. `20261031094500_subscription_read_model.sql`
  4. `20261116090000_native_outbox_event_receipts.sql`
  5. `20261116092000_secure_short_lived_family_codes.sql`
  6. `20261116094000_privacy_rights_requests.sql`
- [ ] Test source SQL `scripts/test-caregiver-invitations.sql` on disposable PostgreSQL; test additional real Supabase Auth and PostgREST flows.
- [ ] Confirm signed-in household members cannot select `naknak_devices.device_secret`; allowed device metadata remains readable.
- [ ] Test cross-household deny on shared state, devices, caregiver invitations, payment status, support tickets and privacy requests.
- [ ] **Version compatibility:** ship v2 RPC before new native client; verify old native builds and old web beta behavior before revoking old functions.
- [ ] Migrate and retire legacy `device_get_state` / `device_push_state` full-state access. The reviewed but **not applied** retirement script sits in `supabase/release-gates/`.
- [ ] Add edge/API-based throttling and security event monitoring for anonymous Family Code guessing; stronger code entropy/30-minute expiry alone is not enough.
- [ ] Validate last successful server receipt vs client clock, offline/outbox retry, duplicate replay, revocation, and household switching.
- [ ] Test PWA offline page, cache separation, failed remote fetch, browser refresh, and authenticated redirects.
- [ ] Test native AppState resume retry and queued event persistence after forced app close and airplane mode.
- [ ] Perform authorized physical-phone tests on **Android and iOS** of direct calling, Ayos Ako, SOS-opened, medicine reminders and reset. **Never call emergency services during test.**
- [ ] Add device-specific status history and warning criteria. A stale server timestamp never means safety.

## P1 full household experience gates
- [ ] Make `family-dashboard.html` the primary management destination; migrate or clearly deprecate old `dashboard.html`, preserve data/URLs and user workflows.
- [ ] Apply and test one-use caregiver invitations with two distinct authenticated accounts; verify owner revocation, expired and already-accepted tokens.
- [ ] Introduce field- and consent-scoped medical profile sharing; existing shared JSON membership is too broad for sensitive personal information.
- [ ] Build a verified local-to-server medication/contact sync only after authorization and consent; otherwise keep local-only labels.
- [ ] Finalize family setup, expiry/copy/rotate pairing, member management, help text and accessible phone navigation.
- [ ] For genuinely supported alerts, build a separate notification delivery system with provider receipt, user acknowledgment, retry, opt-in and failure states. Do not label a server receipt as a delivered caregiver notification.
- [ ] Define and test Free ₱0 / Family ₱199 month / ₱1,990 year plans. No subscriptions may be sold until recurring provider flow, renewal, refund, cancellation, expiry, entitlements, reconciliation and store policy review are completed.

## P2 launch and operations
- [ ] Review P2 shared prep/support RLS and enable in staging; assign staff-facing intake/triage with authenticated staff authorization.
- [ ] Confirm data-rights intake is monitored. Actual export, deletion and retention controls need staff verification and legal review; a request form is not deletion.
- [ ] Create a privacy-aware retention schedule, risk assessment, legal basis/consent documentation, breach process and customer support SLAs.
- [ ] Match official NakNak logo unchanged on all assets. Test red #C4301E, maroon #7A1008, ivory #FFF8F2, WCAG focus/contrast and reduced motion.
- [ ] Build production app assets/screenshot captures from **real phone builds**. Draft store listing in `STORE-LISTING-DRAFT.md`; no false push/dispatch/location claims.
- [ ] Fix Expo SDK 57 patch alignment and regenerate committed pnpm lockfile; rerun Expo Doctor and Expo web export.
- [ ] Run monitored pilot with 20–30 consenting households using non-emergency scenarios; collect reliability/failure rates, support volume and accessibility findings before opening billing.

## Stop-ship conditions
Any failed cross-household data test; leaked pairing/device secret; no durable acknowledgment for queued events; misleading SOS status; outdated privacy/consent; unverified caregiver notification delivery claim; payment activation without verified recurring subscription; inability to access/restore database backups; or missing real-device test results.

## Release record to complete before launch
| Item | Evidence link / responsible reviewer | Status |
|---|---|---|
| Staging Supabase migrations + backups | Pending authorized project owner | BLOCKED: DB 28P01 |
| Event replay/idempotency SQL CI | GitHub Actions on PR #13 | Review latest run |
| SDK 57 Expo Doctor | GitHub Actions | FAIL: patch drift |
| Real Android test | Pending tester and device | NOT RUN |
| Real iOS test | Pending tester and device | NOT RUN |
| Family roles and privacy consent | Pending security review | NOT VERIFIED |
| PayMongo recurring lifecycle | Pending provider integration | NOT IMPLEMENTED |
| App Store / Play accounts and review | Pending owner access | NOT STARTED |

Do not deploy unverified safety features just to make this checklist appear completed.
