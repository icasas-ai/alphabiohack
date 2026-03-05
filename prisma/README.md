# Prisma and Seed Notes

This folder contains the Prisma schema, migrations, and seed scripts.

## Current Layout

- `schema.prisma` - source of truth for the database schema
- `migrations/` - committed SQL migrations
- `seeds/` - local seed helpers

## Seed Behavior

Entry point:

- [seeds/seed.ts](./seeds/seed.ts)
- [seeds/production.ts](./seeds/production.ts)

The seed currently runs these steps:

1. users
2. locations
3. legacy business hours
4. specialties
5. services
6. bookings

## Important Characteristics

- the seed is intended for local development
- it is not a destructive full reset by itself
- each seed section checks for existing records and skips creation when data already exists
- `npm run db:reset` is the destructive command, not `npm run db:seed`
- `npm run db:seed:prod` is a separate, production-safe bootstrap for a real company and owner user

## Seed User Defaults

Default seed users now live in:

- [seeds/config/default-users.ts](./seeds/config/default-users.ts)

This file is the source of truth for the local seed profiles, including the default therapist user.

Important:

- local self-signup still creates `Patient` users
- the seeded therapist is the practical source for the company's `publicTherapistId` or `DEFAULT_THERAPIST_ID` in local development
- if you want different local default users, edit the seed config file instead of `.env.local`

## Common Commands

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run db:seed:prod
npm run db:reset
npm run db:studio
```

## Notes

- if you add schema changes, create a migration and regenerate Prisma client
- if you add seed assumptions, keep them aligned with `seeds/config/default-users.ts` and the local setup docs
- dated availability data is not currently seeded by default; availability periods are expected to be created from the admin UI
- `db:seed:prod` does not create demo bookings, demo locations, or seed users with fake passwords
- `db:seed:prod` expects bootstrap env vars such as `BOOTSTRAP_COMPANY_SLUG`, `BOOTSTRAP_COMPANY_NAME`, and `BOOTSTRAP_OWNER_EMAIL`
