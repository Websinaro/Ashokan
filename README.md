# Ledge — College Attendance Tracker

A production-ready Next.js app (with its own built-in server, no separate backend needed) for
tracking daily college attendance, period by period, across a semester. Data is stored in
MongoDB via Mongoose. It's also an installable PWA — see below.

## Features

- **One-step account creation** — name, college name, and a password. No email required.
- **Persistent login** — signed session cookie (httpOnly) that lasts 30 days.
- **Calendar dashboard** — a ledger-styled month view. Only **today** is clickable.
- **Daily entry window** — mark whether you went to college and tick off each period as
  attended / missed. You can rename, add, or remove a period for that specific day only
  (e.g. an extra class or a cancelled one), without touching your default semester schedule.
- **Settings** — define your semester start/end (defaults to a 6-month span) and your normal
  daily periods.
- **Statistics** — total marked days, present/absent counts, day- and period-level attendance
  percentages, a per-period breakdown, and semester progress.
- **Past and future days are locked** — the server rejects any write to a date other than
  today, so history can't be edited and future days can't be pre-filled.

## Tech stack

- Next.js 14 (App Router) — pages **and** API routes live in the same app, so there's no
  separate server to run.
- MongoDB + Mongoose
- JWT session cookies (`jsonwebtoken` + `bcryptjs`)
- Tailwind CSS

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in your own values:

   ```bash
   cp .env.example .env.local
   ```

   - `MONGODB_URI` — your MongoDB connection string (a free
     [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works well, or a local `mongod`
     instance, e.g. `mongodb://localhost:27017/attendance-tracker`).
   - `JWT_SECRET` — any long random string, used to sign login sessions. Generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` — you'll land on the sign-up page.

4. **Build for production**

   ```bash
   npm run build
   npm start
   ```

## How the "today only" rule is enforced

The calendar UI only makes today's cell clickable, but that's just for convenience — the real
rule lives in `app/api/attendance/[date]/route.js`, which rejects any `PUT` request where the
URL's date isn't the server's current date (also checked against your semester range). Visiting
`/day/2024-01-01` directly will render the day in a read-only view instead.

## Project structure

```
app/
  api/
    auth/          signup, login, logout, session check
    settings/       get/update semester + period settings
    attendance/     list + per-day read/write
    stats/          aggregated statistics
  login/, signup/    auth pages
  dashboard/         calendar page
  day/[date]/        single-day attendance entry
  settings/          semester & period configuration
  stats/             statistics page
components/          shared UI (Calendar, DayForm, SettingsForm, Navbar, ...)
lib/                 db connection, auth helpers, date helpers, Mongoose models
middleware.js        redirects based on session cookie presence
```

## Installing it as an app (PWA)

Ledge is a fully installable Progressive Web App:

- `public/manifest.json` defines the name, theme colors, and the full icon set generated from
  the app's avatar (`public/icons/`), including maskable variants for Android's adaptive icons.
- `public/sw.js` is a small service worker: it caches the app shell (icons, manifest, static
  `_next` assets) and shows a friendly `offline.html` page if a navigation fails with no
  connection. It intentionally does **not** cache attendance data itself, since that always
  needs to be fresh from the database.
- `components/ServiceWorkerRegister.jsx` registers the service worker on first load.

To install:
- **Desktop Chrome/Edge**: an install icon appears in the address bar once the app is served
  over HTTPS (or `localhost`).
- **Android**: "Add to Home screen" from the browser menu.
- **iOS Safari**: Share → "Add to Home Screen" (uses the Apple touch icon and standalone mode
  configured in `app/layout.js`).

Note: service workers require HTTPS in production (`localhost` is exempt for local testing).

## Notes on the login model

Since sign-up only collects a name, college name, and password (no email), **name is used as
the unique login identifier**. If you'd rather allow duplicate names across different colleges,
change the uniqueness constraint in `lib/models/User.js` to be scoped to `(name, collegeName)`
instead.
