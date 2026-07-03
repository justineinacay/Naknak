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

## 4. How the sync actually works

- The **dashboard** creates a *Family Space* — a row in `naknak_households` with a 6-character pair code, plus a `naknak_state` row holding one JSON blob of your household's data (seniors, medications, contacts, etc).
- The **phone app**, when a caregiver enters that code in Settings → Cloud Sync, subscribes to that same row via Supabase Realtime.
- Every change on either side — a medication marked taken, a note added, an SOS triggered — writes the full state blob back with an incrementing `rev` number, and Realtime pushes it to the other device within roughly a second.
- **Everything still works with zero configuration.** If `SUPA.url`/`anonKey` are left blank, the dashboard shows a clear "not configured" message and the phone app runs entirely offline exactly as before — sync is additive, never required.

## 5. Security note — read before real deployment

The current schema uses **open row-level-security policies** (any anon key holder can read/write any household, given the exact ID or code). This is intentionally the simplest possible v1 so you can test end-to-end today. It is **not** safe for real user data at scale — a determined party could enumerate pair codes.

Before onboarding real families, swap in:
1. **Supabase Auth** (email or phone OTP) for the caregiver.
2. A `household_members` join table linking `auth.uid()` to `household_id`.
3. RLS policies scoped to `auth.uid()` instead of the current `using (true)`.

Flagging this honestly now so it isn't a silent gap later.

## 6. Local testing before you deploy

Every file is a self-contained static HTML page — no server needed:
```bash
cd site && python3 -m http.server 8000
```
Open `http://localhost:8000`.
