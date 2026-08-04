# NakNak

**Always close, even from afar.**

NakNak is a landing page for a Filipino family-safety and caregiving app that connects seniors, PWDs, and their families through real-time check-ins, SOS alerts, medication reminders, and a live family dashboard.

This repo contains the marketing/landing site — a static, single-page site with no build step and no dependencies.

## Live Preview

Once GitHub Pages is enabled (see below), the site will be live at:

```
https://justineinacay.github.io/Naknak/
```

## Project Structure

```
Naknak/
├── index.html          # Full landing page (hero, about, features, how it works, pricing, FAQ)
├── assets/
│   ├── logo-badge.png   # Navbar / footer mark — white heart on red
│   ├── logo-mark.png    # Red heart mark (spare, for other brand touchpoints)
│   └── hero-family.jpg  # Hero section photo
├── .gitignore
└── README.md
```

## Running Locally

No build tools or package manager required — it's plain HTML/CSS/JS.

**Option 1 — just open it:**
Double-click `index.html`, or open it directly in a browser.

**Option 2 — local server (recommended, avoids relative-path quirks):**
```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```
Then visit `http://localhost:8000`.

## Deploying with GitHub Pages

1. Push this repo to GitHub (`main` branch).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Select branch `main`, folder `/ (root)`.
5. Save — the site will be live at `https://justineinacay.github.io/Naknak/` within a minute or two.

Keep `index.html` at the repo root and the `assets/` folder alongside it — the page references images with relative paths (`assets/...`).

## Features

- Fully responsive (mobile, tablet, desktop)
- Light/dark mode toggle, remembered via `localStorage`
- Scroll-reveal animations, respects `prefers-reduced-motion`
- No external JS frameworks — vanilla HTML/CSS/JS, Google Fonts (Sora + Inter) via CDN

## Notes

- The "Google Play" / "App Store" buttons in the **How It Works** section are plain text pills, not the official trademarked badges — swap in the real store badge assets once live download links are ready.
- Pricing, FAQ, and feature copy are placeholder-accurate as of the current draft — update `index.html` directly (no CMS or data file yet).

## Tech Stack

- HTML5 / CSS3 (custom properties for theming)
- Vanilla JavaScript (no frameworks)
- Google Fonts: [Sora](https://fonts.google.com/specimen/Sora) (display), [Inter](https://fonts.google.com/specimen/Inter) (body)

## License

© 2026 NakNak. All rights reserved.
