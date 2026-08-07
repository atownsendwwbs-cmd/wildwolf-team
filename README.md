# Wild Wolf Warehouse

A lightweight internal app for the production floor: a daily brief for the team, low-inventory/supply reporting, and end-of-day reports from managers and employees — all in one place.

## Features

- **Daily Brief** — the focal point of the dashboard. Managers/admins post the day's priorities, work orders to focus on, and anything the team should watch for, in English or Spanish — the app auto-translates it to the other language on post (best-effort, via a free translation API; if translation fails for any reason, the original text is shown instead so nothing blocks). Readers can flip between EN/ES with a toggle. Everyone can read the history.
- **Low Inventory & Supply Alerts** — Anyone can flag low finished goods, raw materials, or warehouse supplies (boxes, tape, thermal labels, gloves, bags, shipping labels, buckets, bucket lids, water, soap, paper towels, toilet paper, etc. — plus a free-text field for anything else). Alerts carry an urgency level and get marked "restocked" by a manager/admin.
- **End of Day Report** — Employees log what was packed, what got sorted out/rejected (and why), where they left off for the next shift, and any notes for the day.
- **Dashboard** — One page showing today's brief, open alerts, and recent end-of-day reports.
- **Team management (admin only)** — Add people, set roles (Employee / Manager / Admin), deactivate accounts.

## Sign-in

Open access, no passwords or PINs — each person just picks their name from a list. Good for a shared warehouse tablet or kiosk. Manage who's on the list (and their role) from **Team** (visible to Admins); deactivating someone removes them from the sign-in list.

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

| Name | Role |
| --- | --- |
| Owner | Admin |
| Production Manager | Manager |
| Warehouse Employee | Employee |

These are placeholders so there's something to sign in with. **Sign in as Owner, then go to Team and rename/replace them with your actual people** (or just add your real team alongside them and deactivate the placeholders).

Roles:
- **Employee** — can submit low-inventory alerts and end-of-day reports, and read daily briefs.
- **Manager** — everything an Employee can do, plus posting daily briefs and marking inventory alerts as restocked.
- **Admin** — everything a Manager can do, plus managing the team (add people, change roles, deactivate accounts).

## Deploying to Vercel

The database is Postgres (Vercel's serverless functions don't have a persistent filesystem, so SQLite isn't an option in production). `npm run build` already runs `prisma migrate deploy` before `next build`, so every deploy applies any new migrations automatically as long as `DATABASE_URL` is set.

1. **Create the database.** In the Vercel dashboard, open (or create) this project → **Storage** tab → **Create Database** → **Postgres** (Neon-backed). This automatically adds connection env vars to the project.
2. **Point `DATABASE_URL` at it.** The Postgres integration typically adds vars named `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `DATABASE_URL` (naming has changed across Vercel's Postgres offerings) — in **Settings → Environment Variables**, make sure a var named exactly `DATABASE_URL` exists and holds the **pooled** connection string (the one meant for serverless — usually the one already named `DATABASE_URL` or `POSTGRES_PRISMA_URL`). If it's only under a different name, add `DATABASE_URL` yourself with that same value.
3. **Add `SESSION_SECRET`.** Settings → Environment Variables → add `SESSION_SECRET` with a long random string (e.g. run `openssl rand -base64 32` locally and paste the output). This signs the login session cookie — use a different value than your local `.env`.
4. **Import the repo.** New Project → import this GitHub repo → deploy. Vercel auto-detects Next.js; no build command overrides needed.
5. **Seed the starter accounts.** From your machine, run `DATABASE_URL="<the same pooled connection string>" npm run db:seed` once against the production database to create the Owner/Manager/Employee accounts listed above. (Or add users straight from the **Team** page after signing in with any account you create by hand.)

Every future `git push` to this branch redeploys automatically and re-applies any new Prisma migrations.

### Other hosting

Since this is a standard Next.js app, it'll run anywhere Node.js does: `npm run build && npm start` behind a reverse proxy (nginx/Caddy), pointed at any Postgres instance via `DATABASE_URL`.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma ORM (Postgres), server actions for all writes, signed JWT session cookie for auth. Theme colors ("Timber & Amber" — warm charcoal + vivid amber accent) live in `app/globals.css` as Tailwind v4 theme tokens, overriding the `neutral`/`orange`/`sky` scales so they apply everywhere automatically. Daily Brief translation runs through MyMemory's free translation API (`lib/translate.ts`) — no API key required, but it's a best-effort public service with modest rate limits, worth swapping for a paid provider (DeepL, Google Cloud Translation) if translation volume grows.
