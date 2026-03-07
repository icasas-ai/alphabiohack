# Local Development

This guide documents the current local development workflow for AlphaBioHack.

Recommended workflow:

- run infrastructure services in Docker
- run the Next.js app on your host machine

That gives you:

- fast file watching with `npm run dev`
- local PostgreSQL
- local Mailpit inbox for email testing
- no app image rebuild for normal source changes

## What this setup supports

- local PostgreSQL
- local auth backed by Prisma
- local email capture with Mailpit
- host-run app with Dockerized services
- full Docker workflow if you want it

## What this does not replace

- Supabase password reset
- Supabase email confirmation
- Supabase Storage flows that still depend on Supabase credentials

If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` are empty, the app uses local auth mode.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop

## 1. Create `.env.local`

Copy the example file:

```bash
cp .env.example .env.local
```

Use this baseline for host-run local development:

```env
# Local auth mode
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

# Local PostgreSQL
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alphabiohack
DB_QUERY=schema=public

# Local Mailpit
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false

# Local auth cookie signing
LOCAL_AUTH_SECRET=replace-this-with-a-strong-random-secret

# Optional: derive location coordinates/timezone from full address
GOOGLE_MAPS_API_KEY=

NEXT_PUBLIC_DEFAULT_COMPANY_SLUG=default-company

DEFAULT_THERAPIST_ID=replace-with-a-real-therapist-users-id
```

Notes:

- `.env.local` is sourced by `sh`, so every assignment must use `KEY=value` with no spaces around `=`
- `LOCAL_AUTH_SECRET` is required whenever Supabase auth is disabled
- `NEXT_PUBLIC_DEFAULT_COMPANY_SLUG` selects the public company/tenant when multiple companies exist
- `DEFAULT_THERAPIST_ID` must be a real Prisma `users.id`
- that user must include `Therapist` in `role`
- local sign-up creates `Patient`, not `Therapist`
- `RESEND_API_KEY` is not needed for local Mailpit testing
- `GOOGLE_MAPS_API_KEY` is optional; if set, location save can try to derive coordinates and timezone from the full office address
- default local seed users now live in [prisma/seeds/config/default-users.ts](/Users/davidguillen/Projects/david/alphabiohack/prisma/seeds/config/default-users.ts)
- the default local company profile lives in [prisma/seeds/config/default-company.ts](/Users/davidguillen/Projects/david/alphabiohack/prisma/seeds/config/default-company.ts)
- if you want a different seeded therapist profile, edit that file instead of setting env vars

## 2. Start local services in Docker

Start PostgreSQL and Mailpit only:

```bash
docker compose up db mailpit
```

Available ports:

- app database: `localhost:5432`
- Mailpit SMTP: `localhost:1025`
- Mailpit inbox UI: `http://localhost:8025`

## 3. Install dependencies

```bash
npm install
```

## 4. Prepare the database

Generate Prisma client:

```bash
npm run db:generate
```

Apply committed migrations:

```bash
npm run db:migrate:deploy
```

Seed local data:

```bash
npm run db:seed
```

If you want to inspect the database in Prisma Studio:

```bash
npm run db:studio
```

## 5. Run the app locally

```bash
npm run dev
```

The app will run at:

- `http://localhost:9001`

## Day-to-day workflow

Start services:

```bash
docker compose up db mailpit
```

Run the app:

```bash
npm run dev
```

For normal code changes:

- just save files
- Next.js should hot reload automatically

You do not need `docker compose up --build` for normal app code edits when the app is running on the host.

## Database commands

Apply committed migrations:

```bash
npm run db:migrate:deploy
```

Check migration status:

```bash
npm run db:migrate:status
```

Create a new migration during development:

```bash
npm run prisma:local -- migrate dev --name your_migration_name
```

Generate Prisma client:

```bash
npm run db:generate
```

Open Prisma Studio:

```bash
npm run db:studio
```

Reset the database:

```bash
npm run db:reset
```

## Migration troubleshooting and recovery

If `npm run db:migrate:deploy` fails locally, use this checklist.

### 1. Validate `.env.local` formatting

The Prisma wrapper script sources `.env.local` directly:

- valid: `DB_USER=postgres`
- invalid: `DB_USER= postgres`

If there is a space around `=`, shell sourcing can fail before Prisma starts.

### 2. Check for a host port conflict

Confirm that PostgreSQL, not another process, owns your configured port:

```bash
lsof -nP -iTCP:5432 -sTCP:LISTEN
```

If the listener is `ssh` or some other service:

- stop that process, or
- change the Docker host mapping from `5432:5432` to `5433:5432`
- then set `DB_PORT=5433` in `.env.local`

### 3. Confirm the DB container is healthy

```bash
docker compose up -d db
docker compose ps db
docker logs alphabiohack-db --tail 50
```

### 4. Retry the normal migration flow

```bash
npm run db:generate
npm run db:migrate:status
npm run db:migrate:deploy
```

### 5. Recover from a failed migration state

If Prisma reports that a migration exists but is marked as failed, resolve it and retry:

```bash
npx prisma migrate resolve --rolled-back 20260312000000_add_booking_number
npm run db:migrate:deploy
```

Use that only when Prisma explicitly shows the migration in a failed state.

### 6. Local-only reset option

If you do not need to preserve local data:

```bash
npm run db:reset
```

This is the fastest recovery path in local development. Do not use it for production databases.

## Local auth behavior

When Supabase env vars are empty:

- `/auth/sign-up` creates a user in PostgreSQL
- `/auth/login` authenticates against PostgreSQL
- session state is stored in an HTTP-only cookie
- protected API routes resolve the current user from that cookie

Important:

- local sign-up creates `Patient` users
- public booking uses the company's `publicTherapistId`, with `DEFAULT_THERAPIST_ID` as a server-side fallback
- if you set `DEFAULT_THERAPIST_ID`, it must point to a therapist-role user

For more detail, see [USER_IDENTITY_MODEL.md](./USER_IDENTITY_MODEL.md).

## Full Docker option

If you want to run the app container too:

```bash
docker compose up --build
```

That starts:

- `db`
- `mailpit`
- `app`

In the full Docker flow:

- the app container injects DB parts (`DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`)
- the app container injects Mailpit SMTP settings
- migrations and seed run automatically through `npm run dev:docker`

Use full Docker when:

- you want the whole stack containerized
- you changed `Dockerfile`
- you changed `package.json`
- you changed `package-lock.json`

For normal frontend/backend source edits, the host-run app workflow is faster.

## Rebuild rules

You need `docker compose up --build` only when image-level inputs change, such as:

- `Dockerfile`
- `package.json`
- `package-lock.json`
- OS packages installed in the image

You do not need rebuilds for:

- `app/`
- `components/`
- `lib/`
- `services/`
- `prisma/`
- translations
- styles

## Troubleshooting

If Prisma commands fail with missing env vars:

- make sure `.env.local` contains `DB_USER`, `DB_HOST`, and `DB_NAME` (plus `DB_PASS` when required)
- use the local wrapper commands like `npm run db:migrate:deploy`

If booking fails with therapist errors:

- verify `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`
- verify that referenced user has role `Therapist`

If local email does not appear:

- make sure `docker compose up db mailpit` is running
- open `http://localhost:8025`

If you want a clean local reset:

```bash
docker compose down -v
docker compose up db mailpit
npm run db:migrate:deploy
npm run db:seed
```
