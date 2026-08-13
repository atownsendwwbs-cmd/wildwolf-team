# Wild Wolf Warehouse

A lightweight internal app for the production floor: a daily brief for the team, low-inventory/supply reporting, and end-of-day reports from managers and employees — all in one place.

## Features

- **Daily Brief** — the focal point of the dashboard, broken into four sections: an **Overview** of the day, **Production** broken down per sales channel (TikTok, Amazon, Faire/Retail, WhatNot, Other), **Order Packing** announcements (what's low, what to watch, new products), and **Special Projects & Announcements**. Written in English or Spanish — the app auto-translates every section to the other language on post (best-effort, via a free translation API; if translation fails, the original text is shown instead so nothing blocks). Readers flip between EN/ES with a toggle. Everyone can read the history.
- **Low Inventory & Supply Alerts** — reporting is tailored per category:
  - **Finished goods** — pick a stock tier (under 100 / 50 / 25 units, or out of stock) instead of a vague urgency level.
  - **Raw materials** — no urgency dropdown; just **Out of material** (highest priority) vs. **Low — more to pack**, plus the exact amount left (bags, boxes, pallets, or weight — free text) and notes, since precision matters most here.
  - **Warehouse supplies** — boxes get an exact size picker (the 10 standard box sizes); buckets, bucket lids, poly bags, and clear bags get a free-text size field; everything else (tape, gloves, labels, water, soap, paper towels, toilet paper, etc.) just needs an urgency level.
  
  All alerts get marked "restocked" by a manager/admin, and everyone can browse open/resolved alerts.
- **End of Day Report** — Employees log what was packed, what got sorted out/rejected (and why), where they left off for the next shift, and any notes for the day.
- **Dashboard** — One page showing today's brief, open alerts, and recent end-of-day reports.
- **Tasks** — managers/admins assign a task to one person (or everyone), which sends a real push notification to their phone. Employees see their open tasks on the dashboard and mark them done; managers/admins can also complete or reopen any task from **Tasks**.
- **Announcements** — a quick "post" box for managers/admins to broadcast something to everyone right now (a truck arriving, a shift change, anything time-sensitive). Pushes to every signed-up phone instantly and shows on the warehouse TV display.
- **Warehouse display (`/display`)** — a public, no-login, auto-refreshing screen meant to run on a monitor around the warehouse: recent announcements, the latest brief, and critical inventory in one glance. Refreshes itself every 30 seconds.
- **Team management (admin only)** — Add people, set roles (Employee / Manager / Admin), assign/reset PINs, rename profiles, deactivate accounts.
- **Installable on phones** — the app is a Progressive Web App: anyone can add it to their home screen (Android shows a native "Install" prompt; iOS shows instructions for Share → Add to Home Screen) and it opens full-screen like a native app, with its own icon.

## Sign-in

The app itself is open — anyone with the link can browse the dashboard, briefs, inventory alerts, and end-of-day reports without signing in. Posting anything (a brief, an inventory alert, an end-of-day report) or managing the team requires signing in with a name + 4-digit PIN, so every report is attributed to a real person. Set up who can sign in (and their PIN) from **Team**, visible once an admin is signed in; deactivating someone revokes their sign-in access (browsing stays open regardless).

The very first time the app is used — before any PIN exists anywhere — it auto-signs you in as an admin so you can reach Team and set up your own name + PIN. That bootstrap path closes itself the moment any PIN is set.

## Getting started (local)

Requires a Postgres database (local install, Docker, or just point at your hosted one — see Deploying below).

```bash
npm install
cp .env.example .env      # set DATABASE_URL to your Postgres connection string, SESSION_SECRET to a long random string
npx prisma migrate dev    # creates the schema
npm run db:seed           # creates starter accounts (see below)
npm run dev
```

Open http://localhost:3000.

### Starter accounts (from `npm run db:seed`)

| Name | Role | PIN |
| --- | --- | --- |
| Alec Townsend | Admin | 1299 |
| Desire | Manager | 1111 |
| Susy | Manager | 2222 |
| Cynthia | Manager | 3333 |
| Chris | Admin | 4444 |
| Keiclyn | Employee | 5555 |

These match the real team — **change PINs you don't recognize from Team**, and add/rename/deactivate anyone as needed.

Roles (browsing is open to everyone regardless of role or sign-in status):
- **Employee** — can sign in to submit low-inventory alerts and end-of-day reports.
- **Manager** — everything an Employee can do, plus posting daily briefs and marking inventory alerts as restocked.
- **Admin** — everything a Manager can do, plus managing the team (add people, change roles, assign/reset PINs, rename profiles, deactivate accounts).

## Deploying to Vercel

The database is Postgres (Vercel's serverless functions don't have a persistent filesystem, so SQLite isn't an option in production). `npm run build` already runs `prisma migrate deploy` before `next build`, so every deploy applies any new migrations automatically as long as `DATABASE_URL` is set.

1. **Create the database.** In the Vercel dashboard, open (or create) this project → **Storage** tab → **Create Database** → **Postgres** (Neon-backed). This automatically adds connection env vars to the project.
2. **Point `DATABASE_URL` at it.** The Postgres integration typically adds vars named `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `DATABASE_URL` (naming has changed across Vercel's Postgres offerings) — in **Settings → Environment Variables**, make sure a var named exactly `DATABASE_URL` exists and holds the **pooled** connection string (the one meant for serverless — usually the one already named `DATABASE_URL` or `POSTGRES_PRISMA_URL`). If it's only under a different name, add `DATABASE_URL` yourself with that same value.
3. **Add `SESSION_SECRET`.** Settings → Environment Variables → add `SESSION_SECRET` with a long random string (e.g. run `openssl rand -base64 32` locally and paste the output). This signs the login session cookie — use a different value than your local `.env`.
4. **Add push notification keys (optional but recommended).** Run `node -e "console.log(require('web-push').generateVAPIDKeys())"` locally and add the three vars from the [Push notifications](#push-notifications) section below. Skip this and the app still works — task/announcement pushes just won't send.
5. **Import the repo.** New Project → import this GitHub repo → deploy. Vercel auto-detects Next.js; no build command overrides needed.
6. **Set up sign-in.** You don't need to run anything for this — the first visit to the deployed app auto-signs you in as an admin (since no PIN exists yet anywhere) so you can go to **Team** and set your real name + PIN, then add the rest of the team. (You can still run `DATABASE_URL="<the same pooled connection string>" npm run db:seed` from your machine instead if you'd rather seed the accounts listed above in one shot.)

Every future `git push` to this branch redeploys automatically and re-applies any new Prisma migrations.

### Other hosting

Since this is a standard Next.js app, it'll run anywhere Node.js does: `npm run build && npm start` behind a reverse proxy (nginx/Caddy), pointed at any Postgres instance via `DATABASE_URL`.

## Installing on a phone

The app is a Progressive Web App (PWA) — no App Store/Play Store listing needed.

- **iPhone (Safari):** open the site, tap the **Share** icon, then **Add to Home Screen**. The app shows a reminder banner with these steps automatically until dismissed.
- **Android (Chrome):** open the site and tap **Install** on the banner that appears (or use Chrome's menu → **Install app**).

Once installed, it opens full-screen with its own icon — no address bar, no need to remember a URL. The manifest and icons are defined in `app/manifest.ts` and `public/icons/` (regenerate them with `node scripts/generate-icons.mjs` if you want a different icon design).

## Push notifications

Tasks assigned to you and announcements arrive as real push notifications — the kind that show up even when the app isn't open — via the standard Web Push API (no third-party notification service, no cost).

**Setup (one-time):** three env vars, generated with `node -e "console.log(require('web-push').generateVAPIDKeys())"`:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` — a `mailto:` address or URL identifying who's sending (required by the push spec)

Add these in Vercel the same way as `DATABASE_URL`/`SESSION_SECRET` (Settings → Environment Variables) — they're already set for local dev in this repo's `.env`. If they're missing, the app still works fine; it just silently skips sending pushes.

**Turning it on, per person:** while signed in, click **Enable notifications** in the nav — that's a real browser permission prompt, so it has to be a deliberate click, not something the app can do automatically. Each device that clicks it gets its own subscription, so someone using both a phone and a desktop can enable it on both.

**Platform notes:**
- **Android (Chrome):** works in a regular browser tab, no install required.
- **iPhone (Safari):** push notifications only work once the app is added to the home screen (Share → Add to Home Screen) — this is an iOS restriction, not something this app can work around. Opening it in a normal Safari tab won't offer notifications at all; the "Enable notifications" area will say so instead of showing the button.
- If someone denies the permission prompt, they won't see it again until they clear that decision in their browser's site settings — the app shows a note explaining this instead of nagging them.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma ORM (Postgres), server actions for all writes, signed JWT session cookie for auth. Theme colors ("Timber & Amber" — warm charcoal + vivid amber accent) live in `app/globals.css` as Tailwind v4 theme tokens, overriding the `neutral`/`orange`/`sky` scales so they apply everywhere automatically. Daily Brief translation runs through MyMemory's free translation API (`lib/translate.ts`) — no API key required, but it's a best-effort public service with modest rate limits, worth swapping for a paid provider (DeepL, Google Cloud Translation) if translation volume grows. Push notifications use the standard Web Push API via the `web-push` package (`lib/push.ts`) and a service worker (`public/sw.js`) — no third-party push service.
