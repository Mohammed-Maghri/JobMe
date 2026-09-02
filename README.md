# ApplyPilot

A job-application tracker. Add the roles you are chasing, move them through a
pipeline, and keep interview and follow-up dates in one place.

Built with Next.js (App Router), Better Auth, Prisma and PostgreSQL.

## What it does

- **Board and list views** of every application, filterable by stage, source
  and contract type, sortable, and searchable by company or role.
- **Seven stages** — Saved, Applied, Screening, Interview, Offer, Rejected,
  Withdrawn — each with its own colour. Move a card by drag-and-drop or with
  the per-card dropdown, which also works with a keyboard and on touch.
- **Dates that matter**: applied, interview and follow-up, with overdue
  follow-ups called out on the card.
- **Summary figures** — totals, applied this week, interviews, offers and
  response rate — all computed in PostgreSQL from your own rows.
- **A status history** for every application, so a stage change is auditable.
- **Email + password and Google sign-in**, sessions in signed httpOnly cookies.

Contract types are a fixed set (`CDI`, `CDD`, `Alternance`, `Stage`,
`Freelance`, part-time) rather than free text, so they can be filtered on.

### Not implemented

The job feed on the landing page is a **fixed sample** used to demonstrate
saving a role. There is no job ingestion, no search backend and no matching or
recommendation engine.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Setup

```bash
npm install
cp .env.example .env    # then fill it in, see below
npx prisma migrate deploy
npx prisma generate
npm run dev
```

## Environment variables

`.env` is git-ignored and must never be committed. `.env.example` lists every
variable with placeholder values.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `BETTER_AUTH_SECRET` | yes | Signs session cookies. `openssl rand -base64 32`. Rotating it invalidates every session. |
| `BETTER_AUTH_URL` | yes | Public origin, e.g. `http://localhost:3000`. Must match the OAuth redirect host exactly. |
| `GOOGLE_CLIENT_ID` | no | From Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | no | Leave both empty to run without Google sign-in — the button hides itself and email/password keeps working. |

Note that Prisma 7 does not read `.env` automatically; `prisma7.config.ts`
loads it via `dotenv/config`, and `DATABASE_URL` is supplied from there rather
than from a `datasource` block.

### Google sign-in

In Google Cloud Console → APIs & Services → Credentials, create an OAuth 2.0
Web application client and add:

- Authorised JavaScript origin: `http://localhost:3000`
- Authorised redirect URI: `http://localhost:3000/api/auth/callback/google`

The redirect path is fixed by the catch-all route at
`app/api/auth/[...all]/route.ts`; a mismatch here is the usual cause of
`redirect_uri_mismatch`. While the consent screen is in Testing, add your own
account under **Test users**.

### Email delivery

Password reset and email verification are deliberately incomplete: there is no
mail provider wired up, so the reset view says so rather than pretending a
message was sent, and `sendVerificationEmail` in `lib/auth.ts` logs the link in
development and throws in production. Connect a provider there, then set
`requireEmailVerification: true`.

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm start            # serve the production build
npm run lint         # eslint
npm test             # vitest, once
npm run test:watch   # vitest, watching
```

## Tests

`vitest`, covering the pure logic: input validation, ownership scoping of every
query, status-transition rules, filter and sort building, and the schema
contract (required indexes, enum members).

```bash
npm test
```

## Notes on authorisation

Every read and mutation is scoped to the session user on the server.
`buildApplicationWhere` takes `userId` as a required argument and throws
without one, so there is no code path that can build an unscoped query. Writes
use `updateMany`/`deleteMany` filtered by `{ id, userId }`, so another
account's id matches zero rows rather than leaking that it exists.

`middleware.ts` redirects signed-in visitors from `/` to `/applications` and
turns signed-out visitors away from `/applications`. That is a routing hint
based on cookie presence with no database lookup — the real gate is
`getCurrentUser()` in the page and `requireUser()` in each server action.
