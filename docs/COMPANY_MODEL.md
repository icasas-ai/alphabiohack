# Company Model

This app now has a foundational `Company` tenant model.

The goal is to separate:

- platform user identity
- business / tenant identity
- membership / role inside a tenant
- public site identity

## Core Concepts

### User

A `User` is a person account:

- email
- auth identity
- first / last name
- avatar
- personal role hints

Users are still stored in the shared `users` table.

### Company

A `Company` is the tenant / business boundary.

Examples:

- one therapist practice
- one clinic with multiple offices
- one company with multiple therapists and staff

`Company` stores tenant-level public information such as:

- company name
- slug
- logo
- public email / phone
- public description / summary
- default timezone
- public therapist reference

### CompanyMembership

A `CompanyMembership` links a user to a company and defines the user role inside that company.

Current membership roles:

- `Owner`
- `Therapist`
- `FrontDesk`
- `Patient`

This is more accurate than relying only on the global `User.role` array.

## Tenant-Owned Records

The following records now carry `companyId`:

- `locations`
- `specialties`
- `services`
- `bookings`
- `availability_periods`
- `availability_days`
- `availability_excluded_dates`

This makes tenant scoping explicit in the database.

## Public Site Resolution

The public site now resolves the business profile from `Company`.

Current lookup is strict:

1. `DEFAULT_COMPANY_SLUG`
2. exact `Company.slug` match in the database

Public booking and public profile then resolve from that company's `publicTherapistId`.

There is no first-company or env-based therapist fallback in the runtime public path anymore.

## Seed Behavior

Local seed now creates a default company profile and memberships.

Seed config files:

- [default-company.ts](/Users/davidguillen/Projects/david/alphabiohack/prisma/seeds/config/default-company.ts)
- [default-users.ts](/Users/davidguillen/Projects/david/alphabiohack/prisma/seeds/config/default-users.ts)

The seed flow:

1. creates default users
2. creates or upserts the default company
3. creates memberships for seeded users
4. creates company-owned locations, specialties, services, and bookings

## Current Limitations

The company foundation exists, but the app is still mid-transition.

Important current limitations:

- authorization is not fully membership-driven yet
- some routes still rely on legacy role checks
- public therapist fallback still exists
- the app does not yet resolve company from subdomain/domain

## Target Direction

The intended production direction is:

- company-scoped authorization
- public site resolved by company domain/subdomain
- staff and therapist access managed by company membership
- optional therapist / office assignments for FrontDesk users

For the broader rollout plan, see [PRODUCTION_READINESS.md](/Users/davidguillen/Projects/david/alphabiohack/docs/PRODUCTION_READINESS.md).
