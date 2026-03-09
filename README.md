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
  - phone-first basic info capture with saved-detail suggestions
  - confirmation flow that creates or links patient profiles automatically
- therapist/admin management views for:
  - locations
  - specialties and services
  - availability
  - appointments
  - profile
- email appointment invites
- local development with PostgreSQL, Mailpit, and app-managed auth

## Main Capabilities

### Booking

- multiple booking types
- service-based booking flow
- therapist-aware booking
- phone-based patient detail lookup during booking
- automatic patient profile creation on booking confirmation
- exact-email matching for safe patient linking
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

- app-managed auth with signed cookies
- password hashes stored in Prisma users
- Supabase is not used for auth or password reset
- optional Supabase Storage when project env vars are present

### Email

- Resend for non-local environments
- SMTP/Mailpit for local development

## Important Architecture Notes

### 0. Supabase Is Infrastructure Here, Not Identity

Current split:

- Supabase Postgres can host the database
- Supabase Storage is optional for uploads
- users, sessions, password reset, and personnel password flows are app-managed
- no Supabase Auth users are required

This matters for deployment and operations:

- production bootstrapping creates staff users in Prisma
- forgot-password and personnel reset happen through the app email flows
- Netlify env should include storage vars only if you actually use uploads

### 1. Dated Availability Is The Primary Scheduling Direction

The booking flow is based on explicit dated availability.

Core availability tables:

- `availability_periods`
- `availability_days`
- `availability_time_ranges`
- `availability_excluded_dates`
- `availability_excluded_time_ranges`

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

- public site resolves the company from the server-side `DEFAULT_COMPANY_SLUG`
- public booking/profile resolve therapist identity from that company's `publicTherapistId`
- some internal flows still need deeper tenant-aware authorization refactoring

For more detail, see [docs/USER_IDENTITY_MODEL.md](docs/USER_IDENTITY_MODEL.md).

### 3. Local Sign-Up Does Not Create Therapists

Local self-signup creates `Patient` users.

If you want public booking to work in local development:

- create or seed a therapist user
- assign that user as the company's `publicTherapistId`

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

APP_AUTH_SECRET=replace-this-with-a-strong-random-secret
DEFAULT_COMPANY_SLUG=default-company
```

Important:

- `.env.local` is sourced by a shell wrapper, so use `KEY=value` with no spaces around `=`
- `APP_AUTH_SECRET` is required because auth is app-managed
- `DEFAULT_COMPANY_SLUG` must match the single company row for this deployment
- that company must have a valid `publicTherapistId` that points to a therapist-role user

For the full local guide, see [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

## Common Commands

- `npm run dev` - run the app locally
- `npm run dev:docker` - app startup flow inside Docker
- `npm run db:generate` - generate Prisma client using `.env.local` by default
- `npm run db:migrate:deploy` - apply committed migrations using `.env.local` by default
- `npm run db:migrate:status` - check migration status
- `npm run db:seed` - seed local data
- `npm run db:seed:demo` - seed a realistic demo practice with polished sales-call data and bookable availability
- `npm run db:seed:e2e` - seed high-volume synthetic e2e validation data with bookable availability
- `npm run db:seed:prod` - bootstrap a real company and owner user without demo data
- `npm run db:reset` - reset and reseed the database
- `npm run db:reset -- --demo` - reset and reseed with the realistic demo dataset
- `npm run db:reset -- --e2e` - reset and reseed with synthetic e2e data
- `npm run db:studio` - open Prisma Studio using `.env.local` by default

All Prisma and seed wrapper scripts default to `.env.local`, but you can point them at another env file when needed:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
```

### Demo Seed

Use the demo seed when you want a sales-call-ready practice instead of bare local fixtures or synthetic e2e data:

```bash
npm run db:reset -- --demo
```

Important:

- set `DEFAULT_COMPANY_SLUG=harbor-balance-wellness`
- the seeded company name is `Harbor Balance Wellness`
- all seeded demo users share the password `HarborDemo123!`
- the demo seed creates realistic staff, patients, locations, upcoming availability, and mixed booking history

### Demo Release

If you want a hosted demo environment with the realistic demo data, use the production env file but run the demo seed instead of the production bootstrap seed:

```bash
cp .env.production.example .env.production
# fill the production values, then:

ALPHABIOHACK_ENV_FILE=./.env.production npm run db:generate
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:demo

set -a
source ./.env.production
set +a
npm run build
```

For a demo release:

- set `DEFAULT_COMPANY_SLUG=harbor-balance-wellness`
- do not run `npm run db:seed:prod`
- you do not need `BOOTSTRAP_*` variables unless you intentionally want the real production bootstrap instead of demo data
- use an isolated database and isolated auth secret because the demo users all share `HarborDemo123!`
- main demo admin login: `sofia.ramirez@example.com` / `HarborDemo123!`

For the full hosted runbook, including which Netlify secrets to update, see [docs/DEPLOY_NETLIFY_SUPABASE.md](docs/DEPLOY_NETLIFY_SUPABASE.md).

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

If you want the reset flow to seed the synthetic e2e dataset instead:

```bash
npm run db:reset -- --e2e
```

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
- some storage/upload flows still depend on Supabase when uploads are enabled

That means the app already works well as a booking and therapist operations platform, but the next major evolution is a cleaner multi-tenant identity model.
