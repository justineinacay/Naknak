# NakNak Brand Guidelines

Everything in this document is pulled directly from the actual live
codebase (`index.html`, `dashboard.html`, `app.html`), not invented
separately — if the code and this document ever disagree, the code is
probably right and this file needs updating.

## Logo

The NakNak mark is a red, folded-paper "N" that reads as both a
letterform and a heart — the two ideas the product is built on: it's
your family's name, and it's about care.

**Files** (in `assets/`):
| File | Size | Use |
|---|---|---|
| `logo.webp` | 96×96 | Nav bar, inline UI, anywhere small |
| `logo-512.webp` | 512×512 | Footer, social previews, print, anywhere large |
| `favicon.ico` | 16/32/48 multi-size | Browser tab icon (legacy browsers) |
| `favicon-16x16.png`, `favicon-32x32.png` | exact size | Browser tab icon (modern browsers) |
| `apple-touch-icon.png` | 180×180 | iOS home screen icon |
| `icon-192.png`, `icon-512.png` | exact size | PWA / Android home screen icon |

**Clear space:** leave at least the height of the heart itself as
empty margin on all sides. It's a dense shape — it needs room to not
feel cramped next to other elements.

**Minimum size:** don't render smaller than 24×24px. Below that, the
folded-paper facets stop reading clearly.

**Don't:**
- Don't recolor it. It's red for a reason — see the emergency-red note below.
- Don't add a drop shadow, outline, or background shape behind it. It
  already has dimension built into the fold lines.
- Don't stretch it. It's a 1:1 square mark — always constrain
  proportions.

## Color

The palette runs on one non-negotiable rule that shapes everything
else: **red is the emergency color, not the decoration color.**

| Token | Hex | Use |
|---|---|---|
| `--accent` / `--red` | `#C4301E` | Primary brand red — buttons, links, brand mark. Same value as the SOS/emergency red because there is deliberately only one red in this system. |
| `--accent-dark` / `--red-dark` | `#9C2010` | Darker red — gradients, pressed states |
| `--accent-bright` / `--red-bright` | `#E04535` | Lighter red — gradients, hover glows |
| `--accent-hot` / `--red-hot` | `#FF5040` | Hottest red — the heartbeat line, pulse rings, the most urgent state |
| `--green` / `--green-bright` | `#248A3D` / `#34C759` | Success, "I'm fine," confirmed check-ins |
| `--gold` / `--gold-bright` | `#C93400` / `#FF9500` | Caution — missed medication, low battery, low refill. Deliberately *not* red, so a caution never reads as an emergency. |
| `--ink` | `#1D1D1F` | Primary text |
| `--ink2` | `#48484A` | Secondary text |
| `--ink3` | `#6E6E73` | Tertiary/caption text — verified at ~5:1 contrast against white, passing WCAG AA |
| `--cream` / `--cream2` / `--cream3` | `#FFFFFF` / `#F5F5F7` / `#E8E8ED` | Background layers, lightest to slightly-shaded |
| `--card-border` | `#D2D2D7` | Card and input borders |

**The rule that actually matters:** every other color in this system
(green, gold) exists specifically so red never has to do double duty.
If you're ever adding a new UI state and reaching for red because "it's
the brand color" — stop and ask whether what you're building is an
actual emergency. If it isn't, it's gold (caution) or just `--ink2`
(neutral). This is why "missed a dose" is gold, not red, even though
red is the primary brand color — a missed dose is a caution, not a
5-alarm emergency, and the palette should say so at a glance.

## Typography

| Role | Font | Notes |
|---|---|---|
| Display (headlines) | Baloo 2, falling back to Inter/SF Pro Display | Rounded, warm — used for anything that needs personality |
| Body | Inter, falling back to SF Pro Display/SF Pro | Loaded via Google Fonts, no API key or license needed |
| Mono (data, timestamps) | JetBrains Mono | Numeric displays use `font-variant-numeric: tabular-nums` so digits align in columns |

## Voice

- Tagalog-first, not Tagalog-translated-from-English. The product
  speaks to Filipino families in their own words, not in translated
  corporate copy.
- The person managing the dashboard is addressed as family — a
  daughter, a son, a relative — not as a formal "caregiver." That word
  is still used internally as the technical role name in the database
  and code, but it should not appear in copy the reader sees. They're
  not hired help; they're *kapamilya*.
- Short sentences. This app exists for moments of real fear (a fall, a
  missed check-in) — the copy should never make someone work to
  understand it.

## What "on-brand" is not

- Not corporate SaaS blue-and-white minimalism — the whole point is
  that this feels like family, not enterprise software.
- Not cutesy or cartoonish — the audience includes people in genuine
  medical and safety situations. Warmth, not whimsy.
- Not multiple reds. One red, used consistently, is what makes the
  emergency state actually mean something when it appears.
