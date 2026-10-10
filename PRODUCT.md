# NakNak Product

## Product model

NakNak is one family safety system with two intentionally separate user experiences.

### 1. Senior/PWD native app

The native mobile app is the primary safety surface for Senior Citizens and Persons with Disabilities. It is designed for use under stress, limited dexterity, visual or hearing needs, and quick-glance situations.

Core principles:

- Emergency actions always outrank secondary information.
- The home experience remains simple and non-dashboard-like.
- Direct calling is easier than navigating family-management settings.
- Local data remains useful without a continuous internet connection.
- Connected states are shown as delivered only when the server confirms them.
- The interface adapts meaningfully to selected accessibility needs.

### 2. Caregiver / Anak web dashboard

The caregiver experience belongs on the web. It handles household setup, pairing, connected-device management, and the currently supported family status view. Keeping it separate prevents management complexity from crowding the Senior/PWD emergency app.

## Users

NakNak serves:

- Senior Citizens
- Persons with Disabilities (PWDs)
- Caregiver / Anak family members supporting them

## Product purpose

NakNak keeps essential safety actions close at hand while giving family members a clearer support surface. Success means a Senior/PWD user can immediately understand what to do and a caregiver can distinguish between:

- an action saved only on the phone,
- an action confirmed by NakNak's server,
- and a capability that has not yet been implemented.

## Brand personality

Reassuring, dignified, direct, Filipino, and family-centered. Never childish, alarmist, overly clinical, or patronizing.

## Anti-patterns

- Hiding emergency controls below dense content.
- Presenting a caregiver dashboard inside the Senior/PWD emergency home.
- Claiming that push, SMS, calling, location, or fall alerts happened when they did not.
- Requiring unnecessary confirmations before opening the phone dialer.
- Small touch targets or low-contrast secondary controls.
- Marketing unfinished safety functionality as active.
- Treating NakNak as a replacement for emergency services or professional care.

## Accessibility & inclusion

Target:

- touch targets of at least 44×44 CSS points/pixels,
- strong contrast,
- visible focus and selected states,
- screen-reader labels for interactive controls,
- reduced-motion respect,
- safe-area-aware layouts,
- large readable text,
- clear haptic/visual feedback,
- simplified guidance for cognitive/memory needs.

## Current native capability boundary

Implemented:

- Senior/PWD onboarding
- language and accessibility choices
- direct dialer calling
- emergency contacts
- local medication schedules and reminders
- offline local app data
- Family Code pairing
- secure device credential
- server-confirmed Ayos Ako status
- server-confirmed SOS-opened status
- device disconnect/revocation path

Not implemented:

- remote caregiver push notification
- automatic SMS
- automatic calling
- automatic location sharing
- fall detection

These boundaries must remain visible in marketing, support, privacy, and store-review materials until implementation changes.
