# NakNak

**Safety and support, always within reach.**

NakNak is a Filipino safety and support system built around a simple product split:

- **Senior/PWD native app** — emergency calling, Ayos Ako check-ins, emergency contacts, local medication reminders, accessibility settings, offline-first local data, and optional Family Code pairing.
- **Caregiver / Anak web dashboard** — authenticated household setup, pairing/device management, and the currently supported family status view.
- **Public website** — explains the product, capability boundaries, privacy, and support without claiming unfinished safety features.

A paired native phone can currently send server-confirmed **Ayos Ako** and **SOS opened** status to its assigned Senior/PWD record in the Caregiver / Anak dashboard. Remote caregiver push, SMS, automatic calling, automatic location sharing, and fall detection remain unimplemented.

## Public pages

- Website: `index.html`
- Caregiver / Anak dashboard: `dashboard.html`
- Family-first Dashboard: `family-dashboard.html` — connected household records, setup, connection checks, daily care, prep (shared after migration), support (after migration)
- Web safety beta: `app.html`
- Privacy & data notice: `privacy.html`
- Support: `support.html`

GitHub Pages URL:

```
https://justineinacay.github.io/Naknak/
```

## Product architecture

NakNak deliberately separates emergency use from caregiver management.

### Senior/PWD native app

The mobile app should remain fast, readable, and low-decision under stress. The emergency home prioritizes the NakNak SOS entry point, Ayos Ako, direct calling, medications, contacts, and profile/family connection.

### Caregiver / Anak dashboard

Caregiver management remains on the web so family members can use phones, tablets, or computers without adding dashboard complexity to the Senior/PWD emergency phone.

The old native caregiver milestone route remains only as a migration handoff for older beta state. It directs caregivers to the web Family Dashboard instead of presenting an incomplete native dashboard.

## Current verified native capability boundaries

| Capability | Current state |
| --- | --- |
| Direct phone dialer calling | Implemented |
| Local emergency contacts | Implemented |
| Local medication schedules/reminders | Implemented when notification permission is granted |
| Offline local data | Implemented |
| Family Code pairing | Implemented |
| Caregiver dashboard status | Ayos Ako and SOS-opened only |
| Secure local device credential | Implemented |
| Remote caregiver push | Not implemented |
| SMS / automatic calling | Not implemented |
| Automatic location sharing | Not implemented |
| Fall detection | Not implemented |

The operating system and mobile carrier ultimately control whether a call can be placed. Physical-device testing is still required before a public store release.

## Native development

See [`native/README.md`](native/README.md).

Useful checks from `native/`:

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm exec expo-doctor
pnpm exec expo export --platform web
```

Preview builds:

```bash
pnpm exec eas build --platform ios --profile preview
pnpm exec eas build --platform android --profile preview
```

## Web development

The public website is plain HTML/CSS/JS and can be served locally with:

```bash
python3 -m http.server 8000
```

The legacy web safety build is generated from `web-src/naknak-app.builder.html`:

```bash
node scripts/build-web.mjs
node scripts/verify-web.mjs
```

## Before public App Store / Google Play release

- Test calling, notifications, offline relaunch, Family Code pairing, Ayos Ako, SOS-opened delivery, disconnect/revocation, and app reset on physical iOS and Android devices.
- Complete App Store / Play privacy disclosures using the actual production data flows.
- Review the public privacy notice before submission.
- Produce final store screenshots, descriptions, support URL, privacy URL, age rating, and review notes.
- Confirm all store listing copy matches implemented capabilities.
- Add remote push/location/fall detection claims only after those features are actually implemented and tested.
- Review digital-plan billing against Apple and Google store rules before selling in-app digital features.

## License

© 2026 NakNak. All rights reserved.


## P0–P2 review phase

The new household operations rollout is documented in [P0-P2-IMPLEMENTATION.md](P0-P2-IMPLEMENTATION.md). These dashboard modules should not be treated as production-complete until their required migration, access policy tests, device tests, and provider integrations pass. The secure native sync currently covers confirmed Ayos Ako and SOS-opened events only.


## P0–P1 reliability and caregiver invitations

The family-first dashboard now includes multi-household switching, an explicit server-baseline Ayos Ako test, fresh-record warnings, actual seven-day activity counts, and an owner-gated invitation UI. See [P0-P1-IMPLEMENTATION.md](P0-P1-IMPLEMENTATION.md).

The caregiver invitation and subscription read model database migrations are staged for security review; **not deployed**. Recurring Family checkout is disabled in the review branch until the billing lifecycle is verified. Native remote push/SMS and full medicine synchronization are not implemented.
