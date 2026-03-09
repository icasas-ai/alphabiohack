# Prisma and Seed Notes

This folder contains the Prisma schema, migrations, and seed scripts.

## Current Layout

- `schema.prisma` - Prisma entrypoint that pulls the split schema files together
- `company.prisma`, `user.prisma`, `catalog.prisma`, `location.prisma`, `availability.prisma`, `booking.prisma`, `enums.prisma` - current schema modules
- `migrations/` - committed SQL migrations
- `seeds/` - local seed helpers

## Seed Behavior

Entry point:

- [seeds/seed.ts](./seeds/seed.ts)
- [seeds/production.ts](./seeds/production.ts)

The seed currently runs these steps:

1. users
2. company
3. locations
4. specialties
5. services
6. bookings

## Important Characteristics

- the seed is intended for local development
- it is not a destructive full reset by itself
- each seed section checks for existing records and skips creation when data already exists
- `npm run db:reset` is the destructive command, not `npm run db:seed`
- `npm run db:seed:prod` is a separate, production-safe bootstrap for a real company and owner user
- public booking will create patient records automatically when new emails confirm bookings
- public booking will only auto-link an existing patient on exact email match

## Seed User Defaults

Default seed users now live in:

- [seeds/config/default-users.ts](./seeds/config/default-users.ts)

This file is the source of truth for the local seed profiles, including the default therapist user.

Important:

- local self-signup still creates `Patient` users
- the seeded therapist is the practical source for the company's `publicTherapistId` in local development
- if you want different local default users, edit the seed config file instead of `.env.local`

## Common Commands

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run db:seed:demo
npm run db:seed:prod
npm run db:reset
npm run db:reset -- --demo
npm run db:reset -- --e2e
npm run db:studio
```

To run any Prisma or seed wrapper against a non-local env file, override the default env file explicitly:

```bash
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:migrate:deploy
ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:demo
```

## Notes

- if you add schema changes, create a migration and regenerate Prisma client
- if you add seed assumptions, keep them aligned with `seeds/config/default-users.ts` and the local setup docs
- the default local seed does not create dated availability; use the admin UI or the e2e seed when you need bookable future slots
- `npm run db:seed:demo` creates a realistic demo practice with named staff, patients, locations, bookings, landing-page copy, and dated availability
- the demo seed expects `DEFAULT_COMPANY_SLUG=harbor-balance-wellness` if you want the public site to render that company
- all demo seed users share the password `HarborDemo123!`
- the main demo admin login is `sofia.ramirez@example.com` / `HarborDemo123!`
- `npm run db:reset -- --demo` resets the local database and reseeds it with the realistic demo dataset
- `npm run db:reset -- --e2e` resets the local database and reseeds it with the synthetic e2e dataset
- `npm run db:seed:e2e` creates synthetic users, locations, catalog data, bookings, and bookable dated availability
- `db:seed:prod` does not create demo bookings, demo locations, or seed users with fake passwords
- `db:seed:prod` expects bootstrap env vars such as `BOOTSTRAP_COMPANY_SLUG`, `BOOTSTRAP_COMPANY_NAME`, and `BOOTSTRAP_OWNER_EMAIL`
- for a hosted demo environment, use `ALPHABIOHACK_ENV_FILE=./.env.production npm run db:seed:demo` and set `DEFAULT_COMPANY_SLUG=harbor-balance-wellness`
- for a hosted demo environment, do not keep `BOOTSTRAP_*` env vars unless you also intend to run `db:seed:prod`
