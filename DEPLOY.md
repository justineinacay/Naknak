# NakNak — Deploy Guide

Three files, one Supabase project, zero build step.

```
site/
├── index.html          → marketing landing page
├── dashboard.html       → caregiver web dashboard (Supabase-connected)
├── app.html             → the phone app (senior + caregiver mobile UI)
└── naknak_schema.sql    → run once in Supabase
```

## 1. Create the Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) → New Project. Free tier is enough to start.
2. Open **SQL Editor** → paste the contents of `naknak_schema.sql` → Run.
3. Go to **Project Settings → API**. Copy two values:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon public key** (long string starting `eyJ...`)

## 2. Paste credentials into both files

**`dashboard.html`** — find near the top of the `<script type="text/babel">` block:
```js
const SUPA = { url: "", anonKey: "" };
```
Replace with your values.

**`app.html`** — find the same pattern (search `SYNC_CONFIG`):
```js
const SYNC_CONFIG = { url: "", anonKey: "" };
```
Same two values, same project.

That's the entire integration. No environment variables, no build step — these are plain strings in static HTML.

**Everything still works with zero configuration.** If you leave both blank, `dashboard.html` shows a clear "not configured" message and `app.html` runs entirely offline exactly as before — sync is additive, never required.

## 3. Deploy to GitHub Pages

```bash
git init
git add index.html dashboard.html app.html
git commit -m "NakNak launch"
git branch -M main
git remote add origin https://github.com/<you>/naknak.git
git push -u origin main
```

Then: **Settings → Pages → Source: Deploy from branch → main → / (root)**. Your site is live at `https://<you>.github.io/naknak/` within a minute or two.

## 4. Enable magic-link sign-in (2 min)

Supabase Auth has email magic links on by default, but confirm this before going live:

1. **Authentication → Providers → Email** — make sure it's enabled. "Confirm email" can stay on.
2. **Authentication → URL Configuration → Redirect URLs** — add your GitHub Pages URL, e.g. `https://<you>.github.io/naknak/dashboard.html`. Without this, the magic link will redirect to `localhost` and fail.
3. That's it — no client secret, no OAuth app registration, no consent screen. This is the whole reason magic link was the right call for this product.

## 5. How the sync actually works — and why it's now two different trust models

This app has two very different users, so it uses two different access patterns rather than forcing one compromise on both:

**Caregiver (web dashboard)** signs in for real via magic link. Every table read/write is scoped by Postgres Row Level Security to `auth.uid()` — the database itself refuses to return another household's data, not just the app's UI hiding it.

**Senior's phone (the app)** never logs in — a person with blurred vision should never have to complete an email OAuth flow to ask for help. Instead, pairing calls a `pair_device` database function with the 6-character code; that function verifies the code, checks it hasn't expired, and returns a private `device_secret` — a long random string the phone never displays and the caregiver never sees. From then on, every read (`device_get_state`) and write (`device_push_state`) presents that secret to a function that validates it before touching any data. The phone has **zero direct table access** — anon key alone gets it nothing.

This means:
- A guessed or leaked 6-character code is now only useful for 48 hours (`pair_code_expires_at`), and only lets someone *pair a new device* — it can't read or write existing data by itself.
- If a phone is lost, the caregiver can regenerate the pair code from the dashboard's **Mga Device** panel; the lost phone's old secret still technically works until you also revoke it directly in the Supabase table editor (a "revoke device" button is a natural next addition — flagging it as not yet built).
- The caregiver dashboard still gets instant push updates via Supabase Realtime, because its RLS-scoped session supports that safely. The phone polls every 12 seconds instead of holding a realtime channel open — building realtime for an unauthenticated device correctly requires Supabase's newer Realtime Authorization (per-channel signed tokens) or a database webhook to an Edge Function, which is real additional infrastructure. Polling is honest, correct, and fast enough that a caregiver's note or medication change shows up on the phone within seconds — but it is a deliberate tradeoff, not an oversight.

## 6. Security model, one layer at a time

| Layer | What protects it |
|---|---|
| Caregiver login | Supabase Auth (magic link) — no password to leak |
| Caregiver data access | Postgres RLS scoped to `auth.uid()` via `household_members` |
| Phone data access | Opaque `device_secret`, never a guessable ID, validated inside security-definer functions |
| Pair codes | Expire after 48 hours; regenerating invalidates the old one for *new* pairings |
| Transport | HTTPS everywhere — GitHub Pages and Supabase both enforce TLS |
| Anon key exposure | Expected and safe — the anon key alone now grants access to nothing; every anon-callable function individually validates its own secret |

**What's still a v2, said honestly:**
- No per-device revocation UI yet (only regenerate-the-household-code, which stops *new* pairings but doesn't kill already-paired devices).
- No rate limiting on `pair_device` beyond what Supabase applies platform-wide — a script could still hammer 6-character code guesses. Supabase's default abuse protection covers a lot of this, but a dedicated rate limit (e.g. via a Postgres function tracking attempts per IP, or Supabase Edge Functions) is the next hardening step if this app grows.
- Multiple caregivers per household (e.g. two siblings both watching Nanay) isn't wired up yet — today one auth user = one household owner. Adding it is a small schema addition (`invite_caregiver(email)` RPC inserting into `household_members`), flagged here rather than silently missing.

## 7. Local testing before you deploy

Every file is a self-contained static HTML page — no server needed:
```bash
cd site && python3 -m http.server 8000
```
Open `http://localhost:8000`.

