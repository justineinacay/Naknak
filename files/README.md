# NakNak

**Parang tawag mo sa anak mo. Laging may sasagot.**

NakNak is a Filipino family safety app for seniors and PWDs — one-tap SOS,
medication reminders, and a family dashboard that stays connected in
real time, wherever the family member managing it is. Design pillars:
**Ligtas · Simple · Pang-Pamilya.**

## What's in this repository

| File / folder | What it is |
|---|---|
| `app.html` | The phone app — Senior/PWD mode and family/caregiver mode, single-file React PWA. No build step. |
| `dashboard.html` | The family dashboard — medications, calendar, vitals, safe zone, notifications, billing, and more. |
| `index.html` | The public marketing/landing page. |
| `assets/` | Logo, favicons, and the hero phone photo used by `index.html`. |
| `naknak_schema.sql` | The full Supabase schema — tables, RLS policies, and RPC functions. Run once in the Supabase SQL Editor. |
| `naknak_payment_events_migration.sql` | Adds the payment audit table — already folded into `naknak_schema.sql` too, kept standalone for convenience if you're patching an existing database. |
| `supabase/functions/create-checkout-session/` | Edge Function: creates a PayMongo checkout session with the household ID attached. |
| `supabase/functions/paymongo-webhook/` | Edge Function: verifies PayMongo's signature and activates a plan automatically once payment is confirmed. |
| `DEPLOY.md` | Step-by-step deployment guide (GitHub Pages + Supabase). |
| `PAYMONGO_SETUP.md` | How to wire up real payments — Supabase secrets, deploying the two functions above, registering the webhook. |
| `SECURITY.md` | The actual security model this app runs on, written honestly — what's protected, what isn't yet, and why. |
| `BRANDING.md` | Logo usage, color palette, and voice guidelines — values pulled directly from the live code, not written separately from it. |
| `LICENSE` | Proprietary, all rights reserved. |
| `.gitignore` | Standard excludes, plus a placeholder for `.env` if credentials ever move out of the HTML files. |

## Stack

The three HTML surfaces are plain, dependency-free — no bundler, no
build step, no `npm install` required to run them. Each loads React 18
and Babel standalone from a CDN and compiles JSX in the browser at
request time.

- **Frontend:** React 18 (UMD, CDN) + Babel Standalone (in-browser JSX)
- **Backend:** Supabase (Postgres + Auth + Realtime + Edge Functions)
- **Payments:** PayMongo (Checkout Sessions + webhook — see `PAYMONGO_SETUP.md`)
- **Maps:** Leaflet + OpenStreetMap (no API key required)
- **Weather:** Open-Meteo (no API key required)
- **Fonts:** Inter (dashboard + body text sitewide), Baloo 2 (display headings on the marketing site)

## Quick start

1. Clone this repo and open `index.html` directly, or serve the folder
   locally: `python3 -m http.server 8000`.
2. To connect real data (sign-in, sync), follow `DEPLOY.md` — it covers
   creating a Supabase project, running `naknak_schema.sql`, and
   pasting your project's URL/key into `dashboard.html` and `app.html`.
3. To take real payments, follow `PAYMONGO_SETUP.md` after step 2.
4. Read `SECURITY.md` before deploying with real user data — it
   documents what's protected and, just as importantly, what's still
   manual or unverified, so nothing about the security posture is a
   surprise later.

## License

Proprietary — see `LICENSE`. All rights reserved.

## Contact

Need help or found a bug? **naknak@gmail.com**
