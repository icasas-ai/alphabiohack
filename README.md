# AlphaBioHack

AlphaBioHack is a therapist booking and practice operations platform built with Next.js 15, Prisma, and PostgreSQL.

It combines:

- a public website
- a guided booking wizard
- therapist/location availability management
- specialties and services management
- appointment operations
- internal protected views for practice management

## What The App Does

The current product surface includes:

- public home and contact pages
- public booking flow with:
  - appointment type
  - specialty and service selection
  - therapist/location-aware date and time selection
  - basic info capture
  - confirmation flow
- therapist/admin management views for:
  - locations
  - specialties and services
  - availability
  - appointments
  - profile
- email appointment invites
- local development with PostgreSQL, Mailpit, and local auth

## Main Capabilities

### Booking

- multiple booking types
- service-based booking flow
- therapist-aware booking
- slot validation before booking creation
- invite email generation after booking

### Availability

- dated availability periods
- availability owned by `therapist + location`
- multiple time ranges per day
- per-day session duration
- excluded dates that can be restored later
- month-level review of booking inventory

### Catalog and Operations

- specialties
- services with cost and duration
- locations with timezone support
- appointment views and status handling

### Auth

- Supabase auth when configured
- local auth when Supabase env vars are empty

### Email

- Resend for non-local environments
- SMTP/Mailpit for local development

## Important Architecture Notes

### 1. Dated Availability Is The Primary Scheduling Direction

The newer booking flow is based on explicit dated availability, not only weekly business hours.

Core availability tables:

- `availability_periods`
- `availability_days`
- `availability_time_ranges`
- `availability_excluded_dates`
- `availability_excluded_time_ranges`

Legacy weekly scheduling tables still exist:

- `business_hours`
- `time_slots`
- `date_overrides`
- `override_time_slots`

Those remain in the schema, but the newer booking flow is designed around explicit dated availability.

### 2. The App Is Multi-User, But Not Yet Truly Multi-Tenant

The app now has a foundational `Company` + `CompanyMembership` model, but the full app is still mid-transition toward tenant-aware production behavior.

Current tenant-owned records include:

- locations
- specialties
- services
- bookings
- availability periods / days

The app still also uses one `users` table for:

- patients
- therapists
- admins

A therapist is a `users` row whose `role` includes `Therapist`.

Current public identity behavior:

- public site can resolve the company from `NEXT_PUBLIC_DEFAULT_COMPANY_SLUG`
- public booking therapist resolves from the active company's public therapist, with a server-side fallback to `DEFAULT_THERAPIST_ID`
- some internal flows still need deeper tenant-aware authorization refactoring

For more detail, see [docs/USER_IDENTITY_MODEL.md](docs/USER_IDENTITY_MODEL.md).

### 3. Local Sign-Up Does Not Create Therapists

Local self-signup creates `Patient` users.

If you want public booking to work in local development:

- create or seed a therapist user
- assign that user as the company's `publicTherapistId` or set `DEFAULT_THERAPIST_ID`

## Recommended Local Development Workflow

Use Docker for infrastructure and run the app on the host:

1. start PostgreSQL and Mailpit
2. run Prisma setup commands
3. run the Next.js app locally

### Quick Start

```bash
cp .env.example .env.local
docker compose up db mailpit
npm install
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Then open:

- app: `http://localhost:9001`
- Mailpit inbox: `http://localhost:8025`

### Minimum `.env.local` For Host-Run Local Dev

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alphabiohack
DB_QUERY=schema=public

EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false

LOCAL_AUTH_SECRET=replace-this-with-a-strong-random-secret
DEFAULT_THERAPIST_ID=replace-with-a-real-therapist-users-id
```

Important:

- `.env.local` is sourced by a shell wrapper, so use `KEY=value` with no spaces around `=`
- `LOCAL_AUTH_SECRET` is required when Supabase auth is disabled
- `DEFAULT_THERAPIST_ID` must be a real Prisma `users.id`
- that user must include `Therapist` in `role`

For the full local guide, see [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

## Common Commands

- `npm run dev` - run the app locally
- `npm run dev:docker` - app startup flow inside Docker
- `npm run db:generate` - generate Prisma client using `.env.local`
- `npm run db:migrate:deploy` - apply committed migrations using `.env.local`
- `npm run db:migrate:status` - check migration status
- `npm run db:seed` - seed local data
- `npm run db:seed:prod` - bootstrap a real company and owner user without demo data
- `npm run db:reset` - reset and reseed the database
- `npm run db:studio` - open Prisma Studio using `.env.local`

## Migration Troubleshooting

If `npm run db:migrate:deploy` fails locally, check these first:

1. `.env.local` syntax must be valid shell syntax:

```env
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alphabiohack
DB_QUERY=schema=public
```

Bad example:

```env
DB_USER= postgres
```

2. Confirm PostgreSQL actually owns the configured host port:

```bash
lsof -nP -iTCP:5432 -sTCP:LISTEN
```

If you see `ssh` or another process instead of PostgreSQL, stop that process or move the Docker mapping to another host port such as `5433`, then update `DB_PORT` in `.env.local`.

3. Make sure the database container is healthy:

```bash
docker compose up -d db
docker compose ps db
docker logs alphabiohack-db --tail 50
```

4. Retry the normal flow:

```bash
npm run db:generate
npm run db:migrate:status
npm run db:migrate:deploy
```

Recovery options:

- If Prisma marks a migration as failed and you need to retry it without wiping local data:

```bash
npx prisma migrate resolve --rolled-back 20260312000000_add_booking_number
npm run db:migrate:deploy
```

- If you are in local development and can safely rebuild the database:

```bash
npm run db:reset
```

Do not use `db:reset` against production data.

## Main Project Areas

- [app](/Users/davidguillen/Projects/david/alphabiohack/app) - App Router pages and API routes
- [components/booking](/Users/davidguillen/Projects/david/alphabiohack/components/booking) - booking wizard UI
- [components/availability](/Users/davidguillen/Projects/david/alphabiohack/components/availability) - availability admin UI
- [services](/Users/davidguillen/Projects/david/alphabiohack/services) - business logic
- [prisma](/Users/davidguillen/Projects/david/alphabiohack/prisma) - schema, migrations, seeds
- [docs](/Users/davidguillen/Projects/david/alphabiohack/docs) - supporting documentation

## Supporting Docs

- [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) - local setup, Docker, Prisma commands, Mailpit
- [docs/DEPLOY_NETLIFY_SUPABASE.md](docs/DEPLOY_NETLIFY_SUPABASE.md) - production runbook for Netlify + Supabase (env, migrations, seed, and checks)
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) - complete env var reference, required modes, and deployment notes
- [docs/WINDOWS_SETUP.md](docs/WINDOWS_SETUP.md) - Windows downloads, PowerShell commands, Prisma setup, and startup flow
- [docs/AVAILABILITY_SYSTEM.md](docs/AVAILABILITY_SYSTEM.md) - current availability architecture
- [docs/TIMEZONE_HANDLING.md](docs/TIMEZONE_HANDLING.md) - how office timezone affects booking, availability, and invites
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - schema overview and ER diagram
- [docs/USER_IDENTITY_MODEL.md](docs/USER_IDENTITY_MODEL.md) - user roles and therapist identity resolution
- [docs/ROLES_AND_ACCESS.md](docs/ROLES_AND_ACCESS.md) - current roles, protected pages, and role-guarded API access
- [docs/COMPANY_MODEL.md](docs/COMPANY_MODEL.md) - current company / tenant foundation, memberships, seed behavior, and public-site resolution
- [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) - production architecture gaps, tenant model, staff auth, and rollout plan
- [docs/HANDOFF_CONTEXT.md](docs/HANDOFF_CONTEXT.md) - concise current-state handoff for continuing work in a new chat
- [docs/API_ENDPOINTS_README.md](docs/API_ENDPOINTS_README.md) - API endpoint constants overview
- [docs/SUPABASE_STORAGE_SETUP.md](docs/SUPABASE_STORAGE_SETUP.md) - Supabase Storage setup for upload flows

## Current Gaps / Known Direction

These are the main product and architecture gaps still visible in the codebase:

- no true tenant/subdomain ownership model yet
- therapist creation is still not a first-class admin flow
- public profile identity still needs to be fully unified
- some older Supabase-dependent flows still remain, especially storage and a few auth-adjacent paths

That means the app already works well as a booking and therapist operations platform, but the next major evolution is a cleaner multi-tenant identity model.
