# User Identity Model

This project uses a single `users` table for authenticated accounts, therapists, and patients.

## Overview

A user is a row in `users` with one or more roles:

- `Patient`
- `Therapist`
- `Admin`

Roles are stored as an array, so one user can have multiple roles. Common examples:

- `Patient`
- `Therapist`
- `Admin, Therapist`

There is no hardcoded user limit in the schema. The database supports many users.

## What Counts As A Therapist

A therapist is not a separate table. A therapist is a `users` row whose `role` array includes `Therapist`.

That matters because:

- booking uses `therapistId`
- therapist dashboards use the logged-in user role
- availability belongs to `therapist + location`

If a user exists but does not include `Therapist` in `role`, the therapist APIs reject it.

## How Users Are Created

Current creation paths:

- local sign-up creates a `Patient`
- seeded data can create `Therapist` or `Admin`
- admin/manual DB changes can assign any supported roles

Important:

- self-signup does not create therapists
- public booking expects an existing therapist user

## How Authenticated Views Resolve Identity

Authenticated internal views use the logged-in Prisma user from [contexts/user-context.tsx](../contexts/user-context.tsx).

The user context exposes:

- `user`: auth/session identity
- `prismaUser`: the actual database user row

Most protected pages use `prismaUser` as the source of truth.

Examples:

- dashboard role split: [app/[locale]/(protected)/dashboard/page.tsx](../app/[locale]/(protected)/dashboard/page.tsx)
- availability owner: [components/availability/availability-page.tsx](../components/availability/availability-page.tsx)
- profile editing: [components/profile/profile-form.tsx](../components/profile/profile-form.tsx)

## How Public Booking Resolves The Therapist

Public booking does not use the logged-in user.

It resolves the active therapist from single-therapist config:

- [lib/config/features.ts](../lib/config/features.ts)
- [hooks/use-therapist-config.ts](../hooks/use-therapist-config.ts)
- [contexts/booking-wizard-context.tsx](../contexts/booking-wizard-context.tsx)

The current public booking source is:

- `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`

That value must be:

- a real `users.id`
- for a user whose `role` includes `Therapist`

Booking then fetches that user through:

- [hooks/use-therapist.ts](../hooks/use-therapist.ts)
- [app/api/therapists/[id]/route.ts](../app/api/therapists/[id]/route.ts)

## How Public Home And Contact Resolve Profile Data

Public home/contact pages currently do not use `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`.

They fetch data from:

- [app/api/public/hero/route.ts](../app/api/public/hero/route.ts)
- [app/api/public/contact/route.ts](../app/api/public/contact/route.ts)

Those endpoints currently use `prisma.user.findFirst(...)`.

So today:

- public booking therapist is config-driven
- public hero/contact profile is first-user-driven

This is an architectural inconsistency.

## Do We Have Tenants

Not yet.

There is currently:

- no `Tenant` table
- no `Organization` table
- no subdomain-to-tenant mapping model

The app is multi-user, but not truly multi-tenant.

What exists today is a single public-facing therapist mode layered on top of a shared user table.

## Current Identity Sources

There are effectively three different identity sources in the app:

1. Authenticated internal identity
   - logged-in `prismaUser`

2. Public booking therapist identity
   - `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`

3. Public site profile identity
   - first user returned by the database

If those do not point to the same person, different parts of the app can show different therapist/business data.

## Practical Guidance

For local development:

- keep a dedicated therapist user in `users`
- ensure that user has `Therapist` in `role`
- set `NEXT_PUBLIC_DEFAULT_THERAPIST_ID` to that user's `id`

Do not use a patient-only user as the default booking therapist.

## Recommended Future Direction

If this app is going to support one subdomain per therapist or office, the next architectural step should be:

1. introduce a real tenant or public-profile ownership model
2. map subdomain to that owner
3. make public hero, contact, booking, and availability resolve from the same source of truth
