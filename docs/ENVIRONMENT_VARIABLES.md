# Environment Variables

This document lists the environment variables currently used or expected by AlphaBioHack, what they do, and when they should be set.

Use it together with [.env.example](/Users/davidguillen/Projects/david/alphabiohack/.env.example).

## How To Read This

- `Required` means required for that specific mode or feature, not always for every deployment.
- `Public` means the variable is exposed to client-side code because it starts with `NEXT_PUBLIC_`.
- If both a server and public version exist, prefer keeping them aligned unless you intentionally need different behavior.

## Database

### `DATABASE_URL`

- Public: `no`
- Required: `no` (legacy compatibility fallback only)
- Used for: fallback when DB parts are not provided
- Example:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&uselibpqcompat=true
```

Notes:

- DB parts (`DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`) are the primary configuration in this repository.
- Keep this only for backward compatibility with older environments.

### `DB_USER`

- Public: `no`
- Required: only when `DATABASE_URL` is not set
- Used for: composing Prisma connection URL internally

### `DB_PASS`

- Public: `no`
- Required: optional (required if your database user has a password)
- Used for: composing Prisma connection URL internally

### `DB_HOST`

- Public: `no`
- Required: only when `DATABASE_URL` is not set
- Used for: composing Prisma connection URL internally

### `DB_PORT`

- Public: `no`
- Required: optional
- Used for: composing Prisma connection URL internally

Notes:

- Defaults to `5432` when omitted.

### `DB_NAME`

- Public: `no`
- Required: only when `DATABASE_URL` is not set
- Used for: composing Prisma connection URL internally

### `DB_QUERY`

- Public: `no`
- Required: optional
- Used for: optional query params appended when composing Prisma connection URL internally

Notes:

- Example: `DB_QUERY=pgbouncer=true&sslmode=require&uselibpqcompat=true`
- `pg` currently treats `sslmode=require` as a certificate-verifying mode unless `uselibpqcompat=true` is also present.
- For Supabase pooled runtime connections, prefer `pgbouncer=true&sslmode=require&uselibpqcompat=true`.
- If you intentionally want strict certificate verification, use `sslmode=verify-full` instead.

### `DIRECT_URL`

- Public: `no`
- Required: `no` (legacy fallback only)
- Used for: last-resort fallback only when neither DB parts nor `DATABASE_URL` are set
- Example:

```env
DIRECT_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

Notes:

- Deprecated in this repository as a primary setting.
- Keep only for backward compatibility while migrating older env files.

## Auth

### `NEXT_PUBLIC_SUPABASE_URL`

- Public: `yes`
- Required: only when using Supabase Storage
- Used for: Supabase browser client for optional storage uploads

Notes:

- Must match the same Supabase project as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`.

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

- Public: `yes`
- Required: only when using Supabase Storage
- Used for: Supabase browser client for optional storage uploads

Notes:

- Must match the same Supabase project as `NEXT_PUBLIC_SUPABASE_URL`.

### `SUPABASE_SERVICE_ROLE_KEY` (Deprecated)

- Public: `no`
- Required: `no`
- Used for: not currently read by runtime

Notes:

- Deprecated for user management in this repository.
- You can omit it unless you reintroduce server-side Supabase admin workflows.

### `APP_AUTH_SECRET`

- Public: `no`
- Required: yes
- Used for: signing and verifying app-managed auth session cookies

Notes:

- Use a strong random secret in any non-trivial environment.

## Email

### `EMAIL_PROVIDER`

- Public: `no`
- Required: no
- Used for: selecting email transport
- Allowed values: `smtp`, `resend`

Notes:

- If unset or anything other than `smtp`, the app defaults to `resend`.

### `RESEND_API_KEY`

- Public: `no`
- Required: yes when `EMAIL_PROVIDER` is unset or not `smtp`
- Used for: sending transactional email through Resend

### `SMTP_HOST`

- Public: `no`
- Required: yes when `EMAIL_PROVIDER=smtp`
- Used for: SMTP transport host

### `SMTP_PORT`

- Public: `no`
- Required: yes when `EMAIL_PROVIDER=smtp`
- Used for: SMTP transport port

### `SMTP_SECURE`

- Public: `no`
- Required: no
- Used for: SMTP TLS mode
- Allowed values: `true`, `false`

### `SMTP_USER`

- Public: `no`
- Required: optional
- Used for: SMTP auth username

Notes:

- Only needed if your SMTP server requires authentication.

### `SMTP_PASS`

- Public: `no`
- Required: optional
- Used for: SMTP auth password

Notes:

- Only needed if your SMTP server requires authentication.

### `BOOKING_FROM_EMAIL`

- Public: `no`
- Required: recommended
- Used for: sender address for booking and invite emails, plus some calendar metadata
- Example:

```env
BOOKING_FROM_EMAIL="AlphaBioHack <noreply@example.com>"
```

Notes:

- If unset, the app falls back to `MyAlphaPulse <noreply@myalphapulse.com>`.

### `BOOKING_REPLY_TO`

- Public: `no`
- Required: optional
- Used for: reply-to address on outgoing emails

### `BOOKING_EMAIL_BCC`

- Public: `no`
- Required: optional
- Used for: default BCC on outgoing emails

Notes:

- Useful for archiving appointment mail to an internal inbox.

### `NEXT_PUBLIC_BOOKING_FROM_EMAIL`

- Public: `yes`
- Required: optional
- Used for: organizer email shown in client-side add-to-calendar links and booking confirmation UI

Notes:

- This does not control actual email delivery.
- Keep it aligned with `BOOKING_FROM_EMAIL` when possible.

## Company And Public Site Resolution

### `DEFAULT_COMPANY_SLUG`

- Public: `no`
- Required: yes for any public deployment
- Used for: server-side public company selection

Notes:

- This is the single env var used to decide which company powers public pages and public APIs in a deployment.
- The configured slug must exist in the database.
- The configured company must also have a valid `publicTherapistId` for public profile and booking flows.
- For the realistic demo dataset created by `npm run db:seed:demo`, set this to `harbor-balance-wellness`.

## Location Geocoding

### `GOOGLE_MAPS_API_KEY`

- Public: `no`
- Required: optional
- Used for: geocoding office addresses when creating or updating locations

Notes:

- If unset, automatic address-to-coordinate lookup is skipped.
- Manual coordinates and timezone selection can still work without it.

## Internationalization And Demo Toggles

### `NEXT_PUBLIC_USE_CASE`

- Public: `yes`
- Required: optional
- Used for: toggling special next-intl behavior

Notes:

- The current code only checks whether it equals `locale-cookie-false`.
- When set to that value, locale cookie persistence is disabled.

## Platform And Runtime Variables

### `SITE_URL`

- Public: `no`
- Required: recommended in production
- Used for: canonical site URL and metadata base URL

Notes:

- Prefer setting this explicitly on Netlify and other non-Vercel platforms.

### `NEXT_PUBLIC_SITE_URL`

- Public: `yes`
- Required: optional but recommended to keep aligned with `SITE_URL`
- Used for: public mirror of the canonical site URL

Notes:

- The current metadata code can fall back to this if `SITE_URL` is not set.

### `NODE_ENV`

- Public: `no`
- Required: no, platform-provided
- Used for: secure cookie behavior and normal framework runtime branching

Notes:

- You normally do not set this manually on Netlify or other platforms.

### `VERCEL_URL`

- Public: `no`
- Required: no, but currently read by metadata code
- Used for: deriving `metadataBase` in public and auth layouts

Notes:

- This is a Vercel-specific environment variable.
- On Netlify, the current code will fall back to `http://localhost:9001` unless you patch that logic or provide an equivalent env.
- This affects metadata URL generation, not the core app runtime.

## Production Bootstrap Seed Only

These variables are only used by `npm run db:seed:prod`.

They are not needed for `npm run db:seed:demo`.

If you are doing a hosted demo release, leave these unset and use:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:demo
```

### `BOOTSTRAP_COMPANY_SLUG`

- Public: `no`
- Required: yes for `db:seed:prod`
- Used for: creating or updating the bootstrap company

### `BOOTSTRAP_COMPANY_NAME`

- Public: `no`
- Required: yes for `db:seed:prod`
- Used for: company display name during bootstrap

### `BOOTSTRAP_COMPANY_TIMEZONE`

- Public: `no`
- Required: optional
- Used for: bootstrap company default timezone

Notes:

- Defaults to `America/Los_Angeles`.

### `BOOTSTRAP_PUBLIC_EMAIL`

- Public: `no`
- Required: optional
- Used for: initial company public email during bootstrap

### `BOOTSTRAP_PUBLIC_PHONE`

- Public: `no`
- Required: optional
- Used for: initial company public phone during bootstrap

### `BOOTSTRAP_PUBLIC_DESCRIPTION`

- Public: `no`
- Required: optional
- Used for: initial company public description during bootstrap

### `BOOTSTRAP_PUBLIC_SUMMARY`

- Public: `no`
- Required: optional
- Used for: initial company public summary during bootstrap

### `BOOTSTRAP_PUBLIC_SPECIALTY`

- Public: `no`
- Required: optional
- Used for: initial company public specialty during bootstrap

### `BOOTSTRAP_OWNER_EMAIL`

- Public: `no`
- Required: yes for `db:seed:prod`
- Used for: locating or creating the bootstrap owner user

### `BOOTSTRAP_OWNER_PASSWORD`

- Public: `no`
- Required: optional
- Used for: creating the bootstrap owner's local password, or backfilling one for a legacy user

Notes:

- Required when the owner user does not already exist.
- Also required when an existing owner row still has no `passwordHash`.

### `BOOTSTRAP_OWNER_FIRSTNAME`

- Public: `no`
- Required: optional
- Used for: owner profile firstname during bootstrap

### `BOOTSTRAP_OWNER_LASTNAME`

- Public: `no`
- Required: optional
- Used for: owner profile lastname during bootstrap

### `BOOTSTRAP_OWNER_AVATAR`

- Public: `no`
- Required: optional
- Used for: owner profile avatar URL during bootstrap

## Recommended Sets

### Minimum Local Auth Setup

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

APP_AUTH_SECRET=replace-with-a-strong-random-secret
DEFAULT_COMPANY_SLUG=default-company
```

Important:

- `.env.local` is sourced by local shell wrapper scripts, so assignments must use `KEY=value` with no spaces around `=`
- if local PostgreSQL is exposed on a non-default host port such as `5433`, update `DB_PORT` to match that host port

### Minimum Netlify + Supabase Setup

```env
SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

DB_USER=postgres.[project-ref]
DB_PASS=[db-password]
DB_HOST=[pooler-host]
DB_PORT=6543
DB_NAME=postgres
DB_QUERY=pgbouncer=true&sslmode=require&uselibpqcompat=true

NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[anon-key]

DEFAULT_COMPANY_SLUG=default-company

EMAIL_PROVIDER=resend
RESEND_API_KEY=[resend-api-key]
BOOKING_FROM_EMAIL="AlphaBioHack <noreply@example.com>"
BOOKING_REPLY_TO=support@example.com
```

Migration note:

- Keep `DB_HOST`/`DB_PORT` on Supabase pooler values for Netlify runtime.
- For Supabase pooled runtime connections, `DB_USER` should be the pooled username, typically `postgres.[project-ref]`, not plain `postgres`.
- For one-off Prisma migration commands, temporarily run with direct host/port:
  `DB_HOST='db.[project].supabase.co' DB_PORT='5432' DB_QUERY='sslmode=require&uselibpqcompat=true' npx prisma migrate deploy`

## Netlify Secret Scanning Guidance

On Netlify, classify env vars like this to avoid false-positive build failures.

### Should Be Secret

- `DB_PASS`
- `RESEND_API_KEY`
- `APP_AUTH_SECRET`
- `SMTP_PASS` (if SMTP auth is configured)
- `GOOGLE_MAPS_API_KEY` (optional, policy-dependent)

### Should Be Non-Secret

- all `NEXT_PUBLIC_*` variables
- `SITE_URL`
- `DB_USER`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_QUERY`
- `DEFAULT_COMPANY_SLUG`
- `EMAIL_PROVIDER`
- `BOOKING_FROM_EMAIL`
- `BOOKING_REPLY_TO`
- `BOOKING_EMAIL_BCC`

### Bootstrap-Only (Remove from Netlify after seed)

- all `BOOTSTRAP_*` variables

### Why `NEXT_PUBLIC_*` must be non-secret

- `NEXT_PUBLIC_*` values are intentionally bundled into client/build output.
- If marked secret in Netlify, Secrets Scanner can fail the deploy when it sees those values in `.next` output.
