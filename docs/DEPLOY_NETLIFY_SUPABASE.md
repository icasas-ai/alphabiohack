# Deploy to Netlify + Supabase

This is the production deployment runbook for this repository.

Use this flow when you deploy to:

- Netlify (hosting)
- Supabase (Postgres + optional Storage)

## 0. Current Architecture Split

This repository now uses Supabase only for infrastructure:

- Supabase Postgres: yes
- Supabase Storage: optional
- Supabase Auth: no

Operationally that means:

- staff and patient users live in Prisma tables
- sessions and password reset are app-managed
- you do not create production users in Supabase Auth
- `APP_AUTH_SECRET` is mandatory in every deployed environment

## 1. Prerequisites

- Supabase project created.
- Netlify site connected to this Git repository.
- A production domain (or Netlify subdomain) decided.
- Local `.env.production` file prepared (do not commit it).

## 2. Get Values from Supabase

From Supabase Dashboard:

1. `Project Settings` -> `API`
2. Copy these only if you use Supabase Storage uploads:
 - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
 - `anon public key` -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
3. `Project Settings` -> `Database`
4. Copy connection details:
 - pooler host/port and pooled username -> for runtime/build (`DB_HOST`, `DB_PORT`, `DB_USER`)
 - direct host/port -> for one-off migration sessions when needed

In the Supabase "Connect to your project" modal:

1. `Type` = `URI`
2. `Source` = `Primary Database`
3. Set `Method` = `Transaction pooler` and use it to fill `DB_HOST`, `DB_PORT`, and `DB_USER`
4. Optionally copy `Method` = `Direct connection` for one-off migration sessions

Notes:

- On Netlify runtime, use Supabase pooler host/port in `DB_HOST` and `DB_PORT`, not the direct `db.[project-ref].supabase.co` host.
- For Supabase pooled runtime connections, `DB_USER` should be the pooled username, usually `postgres.[project-ref]`.
- If a Prisma migration fails using pooled connection, temporarily run migrate commands with direct `DB_HOST`/`DB_PORT`.
- If you do not use Storage uploads, leave `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` unset.

## 3. Set the Bootstrap Owner Credentials

`db:seed:prod` creates or updates the owner user inside Prisma and the app-managed auth system.

Then set:

```env
BOOTSTRAP_OWNER_EMAIL=owner@yourdomain.com
BOOTSTRAP_OWNER_PASSWORD=replace-with-a-strong-random-password
```

Notes:

- `BOOTSTRAP_OWNER_PASSWORD` is required on a fresh DB.
- If the owner user already exists with no local password hash, set `BOOTSTRAP_OWNER_PASSWORD` once to backfill one.
- Re-running `db:seed:prod` does not rotate an existing password hash unless it is currently missing.

### Login credentials in production

- The production staff login user is the owner user created or updated by `db:seed:prod`.
- Use `BOOTSTRAP_OWNER_EMAIL` and the password you set in `BOOTSTRAP_OWNER_PASSWORD` at `/auth/login`.
- After first bootstrap, manage future password resets through the app-managed auth flows.

## 4. Create `.env.production`

Start from the template:

```bash
cp .env.production.example .env.production
```

Fill all required values.

Important shell detail:

- If a value contains spaces, quote it.
- Example:

```env
BOOTSTRAP_COMPANY_NAME="AlphaBioHack Practice"
BOOTSTRAP_PUBLIC_DESCRIPTION="Therapist-led practice profile used for the public website."
BOOTSTRAP_PUBLIC_SUMMARY="Book appointments, review availability, and stay connected with your care team."
BOOKING_FROM_EMAIL="AlphaBioHack <noreply@yourdomain.com>"
BOOTSTRAP_OWNER_PASSWORD="replace-with-a-strong-random-password"
```

## 5. Load Env Locally

```bash
set -a
source ./.env.production
set +a
```

Notes:

- The Prisma and seed wrapper scripts now support `ALPHABIOHACK_ENV_FILE`, so you can target `.env.production` directly without sourcing it first.
- Example:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
```

## 6. Initialize Database Schema

Normal case:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
```

### Fresh DB in this repository state

There is a migration ordering issue in `prisma/migrations` where:

- `20260304000100_add_company_header_logo` runs before initial schema migration on a brand-new DB.

If you get `P3018` with `relation "public.companies" does not exist`, run:

```bash
npx prisma migrate resolve --rolled-back 20260304000100_add_company_header_logo
npx prisma migrate resolve --applied 20260304000100_add_company_header_logo
npx prisma migrate deploy
```

This marks the early `headerLogo` migration as already handled, then applies the real initial migration safely.

If `--rolled-back` says the migration is not found in `_prisma_migrations`, skip that line and run only:

```bash
npx prisma migrate resolve --applied 20260304000100_add_company_header_logo
npx prisma migrate deploy
```

If pooled settings fail for Prisma CLI operations, run migration commands with direct host/port just for that command:

```bash
DB_HOST='db.[project].supabase.co' DB_PORT='5432' DB_QUERY='sslmode=require&uselibpqcompat=true' npx prisma migrate deploy
```

## 7. Run Production Bootstrap Seed

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:prod
```

If your runtime `.env.production` uses the Supabase pooler, but the one-off seed fails with TLS or pooler issues, temporarily run the seed against the direct database host and drop `pgbouncer=true` for that run:

```bash
set -a
source ./.env.production
set +a

DB_HOST='db.[project].supabase.co' \
DB_PORT='5432' \
DB_QUERY='sslmode=require&uselibpqcompat=true' \
npx tsx prisma/seeds/production.ts
```

What this seed does:

- creates or updates the bootstrap owner user
- creates or updates the company by slug
- links owner membership as `Owner`
- sets owner as `publicTherapistId`

This seed is intended to be safe/idempotent.

## 7A. Demo Release Variant

If this deployment is a demo environment, do not use `db:seed:prod`.

Instead:

1. Set `DEFAULT_COMPANY_SLUG=harbor-balance-wellness` in `.env.production`
2. Leave `BOOTSTRAP_*` unset unless you intentionally want the real bootstrap owner/company flow
3. Run the demo seed against `.env.production` explicitly:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:generate
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:demo
```

What the demo seed gives you:

- company slug: `harbor-balance-wellness`
- branded public site data
- realistic staff, patients, bookings, locations, and dated availability
- shared login password `HarborDemo123!` for the seeded demo users

Useful seeded login:

- `sofia.ramirez@example.com` / `HarborDemo123!`

Important:

- use a separate Supabase project / database for this demo environment
- use a separate `APP_AUTH_SECRET` for this demo environment
- do not point real traffic or real patient data at a demo-seeded deployment

## 8. Configure Netlify Environment Variables

In Netlify:

1. Open your site
2. `Site configuration` -> `Environment variables`
3. Add values (Production scope) from `.env.production`

Minimum required for this app:

```env
SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

DB_USER=postgres.[project-ref]
DB_PASS=...
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_QUERY=pgbouncer=true&sslmode=require&uselibpqcompat=true

APP_AUTH_SECRET=replace-with-a-strong-random-secret

DEFAULT_COMPANY_SLUG=your-company-slug

EMAIL_PROVIDER=resend
RESEND_API_KEY=...
BOOKING_FROM_EMAIL="AlphaBioHack <noreply@yourdomain.com>"
BOOKING_REPLY_TO=support@yourdomain.com
```

Optional:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- `BOOKING_EMAIL_BCC`
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_BOOKING_FROM_EMAIL`

Bootstrap vars are only needed where you run `npm run db:seed:prod`; they do not need to stay in Netlify after bootstrap.

For a demo release:

- keep `DEFAULT_COMPANY_SLUG=harbor-balance-wellness`
- do not add `BOOTSTRAP_*` values to long-lived Netlify runtime env
- use the demo seed from section `7A` instead of `db:seed:prod`
- make sure `APP_AUTH_SECRET` is new for this environment

Do not add any Supabase Auth settings for login, password reset, or staff management. The app does not use them.

### Netlify Secret Flag Rules (Important)

Do not mark these as secret in Netlify:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SITE_URL`
- `DB_USER`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_QUERY`
- `BOOKING_FROM_EMAIL`
- `BOOKING_REPLY_TO`
- `BOOKING_EMAIL_BCC`
- `NEXT_PUBLIC_BOOKING_FROM_EMAIL`
- `NEXT_PUBLIC_DEFAULT_TIMEZONE`
- `DEFAULT_COMPANY_SLUG`
- `EMAIL_PROVIDER`

Reason:

- `NEXT_PUBLIC_*` values are intentionally included in build output/client bundles.
- If marked secret, Netlify Secrets Scanner will flag them by design.

Keep these as secret:

- `DB_PASS`
- `RESEND_API_KEY`
- `APP_AUTH_SECRET`
- `SMTP_PASS` (if SMTP auth is used)
- `GOOGLE_MAPS_API_KEY` (if your policy treats it as sensitive)

Remove from Netlify runtime env after bootstrap:

- all `BOOTSTRAP_*` variables
- including keys like `BOOTSTRAP_COMPANY_SLUG` and `BOOTSTRAP_OWNER_EMAIL`

Optional scanner fallback (if your team policy forces secret flags on public values):

```env
SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,NEXT_PUBLIC_SITE_URL,SITE_URL,DB_PORT,DB_NAME,DB_QUERY,BOOKING_FROM_EMAIL,BOOKING_REPLY_TO,BOOKING_EMAIL_BCC,NEXT_PUBLIC_BOOKING_FROM_EMAIL,NEXT_PUBLIC_DEFAULT_TIMEZONE,DEFAULT_COMPANY_SLUG,EMAIL_PROVIDER
SECRETS_SCAN_OMIT_PATHS=.env.example,.env.production.example,.netlify/.next/cache/**,.next/cache/**
```

## 9. Trigger Deploy

Current `netlify.toml` build command:

```toml
[build]
  command = "npm run build"
```

Deploy by pushing to your production branch or by clicking `Trigger deploy` in Netlify.

## Recommended Release Sequence

Use this order for a clean production rollout:

1. Update `.env.production` and Netlify env vars.
2. Decide whether this is a real bootstrap release or a demo-data release.
3. For a real bootstrap release, run:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:generate
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:prod
```

4. For a demo release, run:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:generate
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:demo
```

5. Then load the production env in your shell and build:

```bash
set -a
source ./.env.production
set +a
npm run build
```

6. Push the release branch or trigger the Netlify deploy.
7. Run the post-deploy checks below.

## Step-by-Step Demo Release

Use this exact sequence when you want a hosted demo environment with the realistic `Harbor Balance Wellness` dataset.

1. Copy the production template:

```bash
cp .env.production.example .env.production
```

2. Fill `.env.production` with the demo environment values:

- `SITE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `DB_USER`
- `DB_PASS`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_QUERY`
- `APP_AUTH_SECRET`
- `DEFAULT_COMPANY_SLUG=harbor-balance-wellness`
- `EMAIL_PROVIDER`
- `RESEND_API_KEY` or SMTP credentials
- `BOOKING_FROM_EMAIL`
- `BOOKING_REPLY_TO`
- optional storage vars if you use uploads

3. Copy the same runtime values into Netlify Production environment variables.

4. Prepare the database against `.env.production` explicitly:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:generate
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:demo
```

5. Build locally with the production env loaded:

```bash
set -a
source ./.env.production
set +a
npm run build
```

6. Trigger the Netlify production deploy.

7. Validate the demo site:

- home page renders
- contact page renders
- booking flow shows Harbor Balance Wellness content
- login works for `sofia.ramirez@example.com` with `HarborDemo123!`
- a booking can be created
- outgoing email works

8. Keep the environment isolated:

- do not reuse a live production database
- do not keep `BOOTSTRAP_*` env vars in Netlify unless you also run `db:seed:prod`
- rotate `APP_AUTH_SECRET` if you recreate the demo environment

Use `BOOTSTRAP_OWNER_PASSWORD` when either of these is true:

- the production owner user does not exist yet
- the owner user exists from an older auth model but still has no local password hash

After bootstrap succeeds, remove `BOOTSTRAP_*` values from long-lived runtime environments.

## Secrets You Likely Need To Update

If this is a new demo deployment or a new Netlify site, update these production secrets:

- `SITE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `DB_USER`
- `DB_PASS`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_QUERY`
- `APP_AUTH_SECRET`
- `DEFAULT_COMPANY_SLUG`
- `EMAIL_PROVIDER`
- `RESEND_API_KEY` or SMTP credentials
- `BOOKING_FROM_EMAIL`
- `BOOKING_REPLY_TO`

Update these only if you use the related feature:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- `GOOGLE_MAPS_API_KEY`
- `BOOKING_EMAIL_BCC`
- `NEXT_PUBLIC_BOOKING_FROM_EMAIL`

For a demo release specifically:

- set `DEFAULT_COMPANY_SLUG=harbor-balance-wellness`
- do not keep `BOOTSTRAP_*` secrets in Netlify unless you are also using `db:seed:prod`
- rotate `APP_AUTH_SECRET` if this is a fresh demo environment
- keep the demo database isolated because demo users share the same password
- update `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, database credentials, and email provider credentials any time you switch Netlify site, Supabase project, or sending domain

## 10. Post-Deploy Checks

Verify these routes:

- `/`
- `/contact`
- `/booking`
- protected login and dashboard pages

Then verify:

- create booking works
- phone-first patient lookup appears in booking step 4
- booking creates a new patient when the email is new
- booking links to an existing patient only when the email matches exactly
- invite email sends
- `/auth/login` works with the owner user created by `db:seed:prod`
- forgot-password sends the app-managed reset flow
- availability creation and booking slot enforcement work

## Troubleshooting

### `source: no such file or directory`

Check filename and command spacing:

```bash
set -a
source ./.env.production
set +a
```

### `.env.production: command not found: ...`

You have unquoted values with spaces in `.env.production`. Quote them.

### `P3018` / `relation "public.companies" does not exist`

Use the migration resolve workaround in step 6, then run `migrate deploy` again.

### Seed fails with owner password validation

If the owner user does not exist yet, set `BOOTSTRAP_OWNER_PASSWORD`.

If the owner user already exists but came from an older auth model with no local password hash, set `BOOTSTRAP_OWNER_PASSWORD` once so the seed can backfill it.

### `P1011` / `self-signed certificate in certificate chain`

This happens before the seed logic runs. Prisma cannot complete the TLS handshake to Postgres.

Check these in order:

- If you are using the Supabase pooler, prefer `DB_QUERY=pgbouncer=true&sslmode=require&uselibpqcompat=true`.
- For one-off CLI commands like `migrate deploy` or `db:seed:prod`, prefer the direct Supabase host/port with `DB_QUERY=sslmode=require&uselibpqcompat=true`.
- If your network or VPN injects a corporate TLS certificate, trust that CA in Node via `NODE_EXTRA_CA_CERTS=/path/to/root-ca.pem`.
- If you want strict certificate verification, use `sslmode=verify-full` and make sure the presented certificate chain is trusted on your machine.

### `P1001` / `Can't reach database server at db.[project-ref].supabase.co`

This usually means your Netlify runtime is still using the direct Supabase database host instead of the pooled host.

Check these in order:

- In Netlify, set `DB_HOST` to the Supabase pooler hostname, not `db.[project-ref].supabase.co`.
- Set `DB_USER` to the pooled username from Supabase, typically `postgres.[project-ref]`.
- Keep runtime on the pooler port, usually `6543`, with `DB_QUERY=pgbouncer=true&sslmode=require&uselibpqcompat=true`.
- In this repository, `DB_USER`/`DB_PASS`/`DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_QUERY` take precedence over `DATABASE_URL`. If any stale direct-host `DB_*` vars are present, they will override a correct pooled `DATABASE_URL`.
- For one-off commands like `migrate deploy` or `db:seed:prod`, use the direct host only for that command.

### Netlify Secrets Scanner flags `NEXT_PUBLIC_*` values

- Ensure those variables are stored as non-secret env vars.
- If already marked secret, delete and recreate them as non-secret.
- Then run "Clear cache and deploy site".

### Netlify Secrets Scanner flags `SITE_URL` or `NEXT_PUBLIC_DEFAULT_TIMEZONE`

- Keep these values, but store them as non-secret env vars.
- If currently secret-flagged, delete and recreate them as non-secret.
- Then run "Clear cache and deploy site".
