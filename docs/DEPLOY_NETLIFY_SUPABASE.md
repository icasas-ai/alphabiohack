# Deploy to Netlify + Supabase

This is the production deployment runbook for this repository.

Use this flow when you deploy to:

- Netlify (hosting)
- Supabase (Postgres + Auth + optional Storage)

## 1. Prerequisites

- Supabase project created.
- Netlify site connected to this Git repository.
- A production domain (or Netlify subdomain) decided.
- Local `.env.production` file prepared (do not commit it).

## 2. Get Values from Supabase

From Supabase Dashboard:

1. `Project Settings` -> `API`
2. Copy:
 - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
 - `anon public key` -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
3. `Project Settings` -> `Database`
4. Copy connection details:
 - session pooler host/port -> for runtime/build (`DB_HOST`, `DB_PORT`)
 - direct host/port -> for one-off migration sessions when needed

In the Supabase "Connect to your project" modal:

1. `Type` = `URI`
2. `Source` = `Primary Database`
3. Set `Method` = `Session pooler` and use it to fill `DB_HOST` and `DB_PORT`
4. Optionally copy `Method` = `Direct connection` for one-off migration sessions

Notes:

- On Netlify runtime, use session-pooler host/port in `DB_HOST` and `DB_PORT`.
- If a Prisma migration fails using pooled connection, temporarily run migrate commands with direct `DB_HOST`/`DB_PORT`.

## 3. Create the Owner Auth User First

`db:seed:prod` expects an owner email that matches your auth user.

In Supabase:

1. `Authentication` -> `Users`
2. Create user (email/password) for the owner/admin account
3. Copy the user UUID

Then set:

```env
BOOTSTRAP_OWNER_EMAIL=owner@yourdomain.com
BOOTSTRAP_OWNER_SUPABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Notes:

- `BOOTSTRAP_OWNER_EMAIL` should match the Supabase Auth user's email.
- If the user already exists in Prisma, `BOOTSTRAP_OWNER_SUPABASE_ID` is optional.
- On a fresh DB, set both to avoid mismatch issues.

### Login credentials in production

- The production staff login user is the one you create manually in Supabase Auth (`Authentication` -> `Users`).
- Use that same email/password at `/auth/login`.
- `db:seed:prod` links/creates the Prisma user row and roles, but it does not create or change the Supabase Auth password.

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
```

## 5. Load Env Locally

```bash
set -a
source ./.env.production
set +a
```

## 6. Initialize Database Schema

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
DB_HOST='db.[project].supabase.co' DB_PORT='5432' npx prisma migrate deploy
```

## 7. Run Production Bootstrap Seed

```bash
npm run db:seed:prod
```

What this seed does:

- creates or updates the bootstrap owner user
- creates or updates the company by slug
- links owner membership as `Owner`
- sets owner as `publicTherapistId`

This seed is intended to be safe/idempotent.

## 8. Configure Netlify Environment Variables

In Netlify:

1. Open your site
2. `Site configuration` -> `Environment variables`
3. Add values (Production scope) from `.env.production`

Minimum required for this app:

```env
SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

DB_USER=postgres
DB_PASS=...
DB_HOST=...
DB_PORT=6543
DB_NAME=postgres

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...

DEFAULT_COMPANY_SLUG=alphabiohack
NEXT_PUBLIC_DEFAULT_COMPANY_SLUG=alphabiohack

EMAIL_PROVIDER=resend
RESEND_API_KEY=...
BOOKING_FROM_EMAIL="AlphaBioHack <noreply@yourdomain.com>"
BOOKING_REPLY_TO=support@yourdomain.com
```

If you want personnel invitations and temporary password reset from the app while using Supabase auth, also set:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional:

- `BOOKING_EMAIL_BCC`
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_BOOKING_FROM_EMAIL`

Bootstrap vars are only needed where you run `npm run db:seed:prod`; they do not need to stay in Netlify after bootstrap.

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
- `NEXT_PUBLIC_BOOKING_FROM_EMAIL`
- `NEXT_PUBLIC_DEFAULT_TIMEZONE`
- `DEFAULT_COMPANY_SLUG`
- `NEXT_PUBLIC_DEFAULT_COMPANY_SLUG`
- `EMAIL_PROVIDER`

Reason:

- `NEXT_PUBLIC_*` values are intentionally included in build output/client bundles.
- If marked secret, Netlify Secrets Scanner will flag them by design.

Keep these as secret:

- `DB_PASS`
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for Supabase-backed personnel invites/temp password reset)
- `LOCAL_AUTH_SECRET` (only if local auth mode is used)
- `SMTP_PASS` (if SMTP auth is used)
- `GOOGLE_MAPS_API_KEY` (if your policy treats it as sensitive)

Remove from Netlify runtime env after bootstrap:

- all `BOOTSTRAP_*` variables
- including keys like `BOOTSTRAP_COMPANY_SLUG` and `BOOTSTRAP_OWNER_EMAIL`

Optional scanner fallback (if your team policy forces secret flags on public values):

```env
SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,NEXT_PUBLIC_SITE_URL,SITE_URL,NEXT_PUBLIC_BOOKING_FROM_EMAIL,NEXT_PUBLIC_DEFAULT_TIMEZONE,DEFAULT_COMPANY_SLUG,NEXT_PUBLIC_DEFAULT_COMPANY_SLUG,EMAIL_PROVIDER
SECRETS_SCAN_OMIT_PATHS=.env.example,.env.production.example,.netlify/.next/cache/**,.next/cache/**
```

## 9. Trigger Deploy

Current `netlify.toml` build command:

```toml
[build]
  command = "npm run build"
```

Deploy by pushing to your production branch or by clicking `Trigger deploy` in Netlify.

## 10. Post-Deploy Checks

Verify these routes:

- `/`
- `/contact`
- `/booking`
- protected login and dashboard pages

Then verify:

- create booking works
- invite email sends
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

### Seed fails with owner mismatch

`BOOTSTRAP_OWNER_EMAIL` and `BOOTSTRAP_OWNER_SUPABASE_ID` must refer to the same Supabase Auth user.

### Netlify Secrets Scanner flags `NEXT_PUBLIC_*` values

- Ensure those variables are stored as non-secret env vars.
- If already marked secret, delete and recreate them as non-secret.
- Then run "Clear cache and deploy site".

### Netlify Secrets Scanner flags `SITE_URL` or `NEXT_PUBLIC_DEFAULT_TIMEZONE`

- Keep these values, but store them as non-secret env vars.
- If currently secret-flagged, delete and recreate them as non-secret.
- Then run "Clear cache and deploy site".
