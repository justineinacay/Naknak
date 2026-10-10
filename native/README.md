# NakNak Native

This folder contains the Expo/React Native NakNak mobile app.

## v1 product direction

The native app is **Senior/PWD-first**. Caregiver / Anak management lives in the web **NakNak Family Dashboard**. This keeps the installed emergency phone focused on large, understandable safety actions rather than a mixed-role dashboard.

Older beta state may still route to `/caregiver/home`; that screen now acts only as a migration handoff to the web Family Dashboard and offers a reset/setup path for a Senior/PWD phone.

## Current native milestone

- Senior/PWD onboarding with Filipino, English, and Bisaya
- accessibility needs setup
- single-screen emergency home with pinned navigation
- large NakNak SOS entry point
- direct `tel:` calling to a saved primary contact or 911/112
- local emergency contacts
- local medication schedules and on-device reminders
- on-device profile, medication, contact, check-in, and SOS-event storage
- optional Family Code pairing with an assigned Senior/PWD record
- server-confirmed Ayos Ako and SOS-opened status in the Caregiver / Anak dashboard
- secure local storage for the opaque device credential
- revocation/disconnect path
- privacy and support links from Profile

## Capability boundaries

| Capability | Current state |
| --- | --- |
| Direct phone call | Implemented through the device dialer |
| Local medication reminder | Implemented on the device |
| Offline app data | Implemented on the device |
| Family Code pairing | Implemented |
| Caregiver dashboard status | Ayos Ako and SOS-opened status only |
| Caregiver remote push | Not implemented |
| SMS or automatic calling | Not implemented |
| Automatic location sharing | Not implemented |
| Fall detection | Not implemented |

Medication schedules, contacts, and location are not synced by the current native Family Code milestone.

## Run locally

Install Node.js 20 or newer and pnpm:

```bash
pnpm install
pnpm start
```

Quality checks:

```bash
pnpm typecheck
pnpm lint
pnpm exec expo-doctor
pnpm exec expo export --platform web
```

## Build installable apps

The bundle identifiers and EAS profiles are defined in `app.json` and `eas.json`.

```bash
pnpm exec eas build --platform ios --profile preview
pnpm exec eas build --platform android --profile preview
```

Before public release, test calling, reminders, notification cancellation, offline relaunch, pairing, Ayos Ako, SOS-opened delivery, disconnect/revocation, accessibility scaling, and reset behavior on physical iOS and Android devices.

Apple and Google developer accounts, signing credentials, production privacy disclosures, store listings, review notes, screenshots, and approval remain required.
