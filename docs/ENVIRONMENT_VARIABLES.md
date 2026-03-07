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
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=true
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

- Example: `DB_QUERY=pgbouncer=true&sslmode=require`

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
- Required: only when using Supabase Auth or Supabase Storage
- Used for: Supabase browser client, Supabase server client, middleware session handling

Notes:

- If this and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` are both empty, the app falls back to local auth.

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

- Public: `yes`
- Required: only when using Supabase Auth or Supabase Storage
- Used for: Supabase browser client, Supabase server client, middleware session handling

Notes:

- Must match the same Supabase project as `NEXT_PUBLIC_SUPABASE_URL`.

### `SUPABASE_SERVICE_ROLE_KEY`

- Public: `no`
- Required: yes when using Supabase auth and you want to create personnel invites/reset temporary passwords from the app
- Used for: server-side Supabase admin calls (`auth.admin.createUser`, `auth.admin.updateUserById`) in personnel management

Notes:

- Keep this as a secret variable in Netlify.
- Never expose this key to client-side code.

### `LOCAL_AUTH_SECRET`

- Public: `no`
- Required: yes when Supabase Auth is disabled
- Used for: signing and verifying local auth session cookies

Notes:

- Required only for local auth mode.
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
- Required: optional but recommended
- Used for: server-side default company selection

Notes:

- The app uses this to decide which company powers public pages when more than one company exists.

### `NEXT_PUBLIC_DEFAULT_COMPANY_SLUG`

- Public: `yes`
- Required: optional but recommended
- Used for: client-side default company selection

Notes:

- Keep this aligned with `DEFAULT_COMPANY_SLUG`.

### `DEFAULT_COMPANY_ID`

- Public: `no`
- Required: optional
- Used for: server-side fallback company lookup when slug is not provided

Notes:

- This is a compatibility fallback. Prefer using company slug variables first.

### `NEXT_PUBLIC_DEFAULT_COMPANY_ID`

- Public: `yes`
- Required: optional
- Used for: client-visible fallback company lookup when slug is not provided

Notes:

- This is a compatibility fallback. Prefer using company slug variables first.

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

### `BOOTSTRAP_OWNER_SUPABASE_ID`

- Public: `no`
- Required: optional
- Used for: linking the Prisma user row to an existing Supabase Auth user

Notes:

- If the owner user does not already exist in Prisma, this must be set so the production seed can create the Prisma-side user record.

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

## Documented But Not Currently Read By Runtime

These names still appear in docs, but there is no direct `process.env` read for them in the current codebase.

### `DEFAULT_THERAPIST_ID`

- Mentioned in local setup docs as a transitional fallback for public booking.
- Not currently read directly by runtime code in this repository snapshot.

### `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`

- Mentioned in several docs as a transitional fallback for public booking.
- Not currently read directly by runtime code in this repository snapshot.

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

LOCAL_AUTH_SECRET=replace-with-a-strong-random-secret
DEFAULT_COMPANY_SLUG=default-company
NEXT_PUBLIC_DEFAULT_COMPANY_SLUG=default-company
```

Important:

- `.env.local` is sourced by local shell wrapper scripts, so assignments must use `KEY=value` with no spaces around `=`
- if local PostgreSQL is exposed on a non-default host port such as `5433`, update `DB_PORT` to match that host port

### Minimum Netlify + Supabase Setup

```env
SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

DB_USER=postgres
DB_PASS=[db-password]
DB_HOST=[session-pooler-host]
DB_PORT=6543
DB_NAME=postgres

NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[anon-key]

DEFAULT_COMPANY_SLUG=default-company
NEXT_PUBLIC_DEFAULT_COMPANY_SLUG=default-company

EMAIL_PROVIDER=resend
RESEND_API_KEY=[resend-api-key]
BOOKING_FROM_EMAIL="AlphaBioHack <noreply@example.com>"
BOOKING_REPLY_TO=support@example.com
```

Migration note:

- Keep `DB_HOST`/`DB_PORT` on session-pooler values for Netlify runtime.
- For one-off Prisma migration commands, temporarily run with direct host/port:
  `DB_HOST='db.[project].supabase.co' DB_PORT='5432' npx prisma migrate deploy`

## Netlify Secret Scanning Guidance

On Netlify, classify env vars like this to avoid false-positive build failures.

### Should Be Secret

- `DB_PASS`
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for Supabase-backed personnel invites/temp password reset)
- `LOCAL_AUTH_SECRET` (if using local auth mode)
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
- `NEXT_PUBLIC_DEFAULT_COMPANY_SLUG`
- `EMAIL_PROVIDER`
- `BOOKING_FROM_EMAIL`
- `BOOKING_REPLY_TO`
- `BOOKING_EMAIL_BCC`

### Bootstrap-Only (Remove from Netlify after seed)

- all `BOOTSTRAP_*` variables

### Why `NEXT_PUBLIC_*` must be non-secret

- `NEXT_PUBLIC_*` values are intentionally bundled into client/build output.
- If marked secret in Netlify, Secrets Scanner can fail the deploy when it sees those values in `.next` output.
