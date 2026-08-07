# Wild Wolf Warehouse

A lightweight internal app for the production floor: a daily brief for the team, low-inventory/supply reporting, and end-of-day reports from managers and employees — all in one place.

## Features

- **Daily Brief** — Managers/admins post the day's priorities, work orders to focus on, and anything the team should watch for. Everyone can read the history.
- **Low Inventory & Supply Alerts** — Anyone can flag low finished goods, raw materials, or warehouse supplies (boxes, tape, thermal labels, gloves, bags, shipping labels, buckets, bucket lids, water, soap, paper towels, toilet paper, etc. — plus a free-text field for anything else). Alerts carry an urgency level and get marked "restocked" by a manager/admin.
- **End of Day Report** — Employees log what was packed, what got sorted out/rejected (and why), where they left off for the next shift, and any notes for the day.
- **Dashboard** — One page showing today's brief, open alerts, and recent end-of-day reports.
- **Team management (admin only)** — Add people, set roles (Employee / Manager / Admin), reset PINs, deactivate accounts.

## Sign-in

No emails or passwords — each person picks their name from a list and enters a short PIN. Good for a shared warehouse tablet or kiosk. Manage names/PINs from **Team** (visible to Admins).

## Getting started (local)

```bash
npm install
cp .env.example .env      # edit SESSION_SECRET to a long random string
npx prisma migrate dev    # creates the SQLite database
npm run db:seed           # creates starter accounts (see below)
npm run dev
```

Open http://localhost:3000.

### Starter accounts (from `npm run db:seed`)

| Name | Role | PIN |
| --- | --- | --- |
| Owner | Admin | 1234 |
| Production Manager | Manager | 1111 |
| Warehouse Employee | Employee | 2222 |

**Change these PINs (or deactivate/rename the accounts) from Team once you're set up** — sign in as Owner and go to the Team page in the nav.

Roles:
- **Employee** — can submit low-inventory alerts and end-of-day reports, and read daily briefs.
- **Manager** — everything an Employee can do, plus posting daily briefs and marking inventory alerts as restocked.
- **Admin** — everything a Manager can do, plus managing the team (add people, change roles, reset PINs, deactivate accounts).

## Deploying

This is a standard Next.js app, so it can run anywhere Node.js runs. Two straightforward options:

**Vercel** — connect this repo, set `DATABASE_URL` and `SESSION_SECRET` as environment variables, and deploy. Vercel's filesystem isn't persistent between deploys, so for production on Vercel switch the Prisma datasource from SQLite to a hosted Postgres database (e.g. Vercel Postgres, Neon, Supabase): update `provider = "postgresql"` in `prisma/schema.prisma`, swap the `@prisma/adapter-better-sqlite3` usage in `lib/db.ts`/`prisma/seed.ts` for `@prisma/adapter-pg`, point `DATABASE_URL` at the Postgres connection string, then run `npx prisma migrate deploy`.

**Your own server** — `npm run build && npm start` behind a reverse proxy (nginx/Caddy). The SQLite database file (`dev.db` by default) just needs to live on persistent disk; back it up like any other file.

Either way, set a strong, unique `SESSION_SECRET` in production — it signs the login session cookie.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma ORM (SQLite by default), server actions for all writes, signed JWT session cookie for auth.
