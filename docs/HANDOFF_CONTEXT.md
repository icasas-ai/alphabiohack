# Handoff Context

This file captures the most important recent product and architecture changes so a new chat or engineer can recover context quickly.

It is intentionally opinionated and selective.

## Current Product Direction

MyAlphaPulse is evolving from a single-therapist booking app into a therapist operations platform with:

- public booking
- therapist/admin management views
- dated availability
- appointment operations
- staff support (`FrontDesk`)

The next major platform step is a real tenant model.

## Booking And Availability

### Dated availability is now the main scheduling direction

The booking flow is aligned to explicit dated availability, not only weekly recurring hours.

Primary availability tables:

- `availability_periods`
- `availability_days`
- `availability_time_ranges`
- `availability_excluded_dates`
- `availability_excluded_time_ranges`

Legacy weekly-hour tables still exist, but newer booking behavior is built around dated availability.

### Availability ownership

Availability is modeled as:

- `therapist + location + date`

The product intent is:

- irregular schedules
- travel between offices
- explicit date windows
- per-day session duration

### Timezone handling

Timezone is stored per `Location` and booking/availability are intended to honor office-local time, then store UTC.

Relevant docs:

- [TIMEZONE_HANDLING.md](./TIMEZONE_HANDLING.md)
- [AVAILABILITY_SYSTEM.md](./AVAILABILITY_SYSTEM.md)

## User And Role Model

### Current roles

Current `UserRole` values include:

- `Therapist`
- `Admin`
- `Patient`
- `FrontDesk`

### Important distinction

`FrontDesk` is not a tenant/platform admin role.

It is intended to mean:

- therapist employee
- office staff / receptionist
- appointments-only operator

It should not manage:

- locations
- availability
- specialties/services
- broader tenant configuration

### Current FrontDesk implementation

Recent changes added:

- `managedByTherapistId` on `User`
- `mustChangePassword` on `User`
- therapist-owned personnel management page
- invite / resend temporary password flow for app-managed auth
- forced password change on first login
- FrontDesk sidebar/page restriction toward appointments-only use

Relevant files:

- `prisma/schema.prisma`
- `app/api/personnel/*`
- `app/[locale]/(protected)/personnel/page.tsx`
- `components/personnel/personnel-page.tsx`
- `lib/auth/authorization.ts`
- `lib/config/sidebar.ts`

### Current limitation

FrontDesk is therapist-owned, not tenant-owned yet.

That is acceptable for the current pre-tenant phase, but it is not the final production architecture.

## App-Managed Auth Vs Production Hardening

### App-managed auth

The app now uses app-managed auth regardless of whether Supabase Storage is configured.

This now also supports:

- temporary password creation for FrontDesk
- login redirect to password update when `mustChangePassword = true`
- app password update route

Relevant files:

- `app/api/auth/app/login/route.ts`
- `app/api/auth/app/update-password/route.ts`
- `components/auth/login-form.tsx`
- `components/auth/update-password-form.tsx`
- `app/[locale]/auth/login/page.tsx`
- `app/[locale]/auth/update-password/page.tsx`

### Production limitation

The current FrontDesk invite/reset flow is production-safe only as a development pattern.

Why:

- it depends on app-managed auth with emailed temporary passwords
- it sends temporary passwords by email

For production, this should be replaced with:

- real auth-provider-backed invite flow
- secure password-set / invite link
- no reusable plaintext password emailing

See:

- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)

## Public Identity And Booking Context

### Public site vs booking

One major earlier inconsistency was:

- booking resolved from configured therapist
- some public pages resolved from `findFirst(user)` or constants

That was partially corrected by adding a shared public-profile resolver so public home/contact/booking align better with the same therapist context.

Relevant file:

- `services/public-profile.service.ts`

### Remaining architectural gap

The app still does not have a true tenant or domain/subdomain resolution model.

It still relies on a default therapist/public-profile fallback in some places.

That is the biggest remaining platform gap.

## UI / UX Work Recently Done

There was a broad UI/UX pass across the app:

- stronger semantic colors and tokens
- better tabs, cards, buttons, inputs, alerts, badges
- clearer booking selection/loading/missing states
- sidebar cleanup
- availability layout cleanup
- locations redesign
- appointments list/calendar improvements

Notable UX work:

- booking summary/context improvements
- timezone messaging in booking
- appointments create/edit dialogs
- calendar/list status handling
- styled confirmation dialogs instead of browser confirms

## Navigation

Current sidebar behavior:

- main sections open based on current route
- `Website` section removed from the authenticated main nav
- `Public View` added to bottom secondary links
- `Public View` opens in a new tab

Current FrontDesk target behavior:

- appointments only
- no management pages

## Appointments

### Current improvements

Appointments now support:

- list view filters
- calendar view
- status updates with confirmation
- internal create appointment flow for operators
- shared edit dialog from list + calendar

### FrontDesk intent

FrontDesk should be able to:

- create appointments on behalf of clients
- edit participant details
- reschedule
- cancel
- update booking status

Nothing beyond appointment operations.

## Production-Readiness Direction

The recommended platform direction is:

1. add a real `Tenant` model
2. add `TenantMembership`
3. scope core resources by `tenantId`
4. resolve public site/booking by tenant context, not default therapist
5. move auth/invite flow for staff to real provider-backed secure invites

See:

- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)

## Important Pending Work

### 1. Tenant model

Still not implemented.

This is the next major architecture step.

### 2. Platform admin area

Still not implemented.

Needed for:

- creating tenants
- creating therapists
- onboarding first owner/therapist per tenant

### 3. Staff assignment granularity

Not implemented yet.

Current FrontDesk is owned by therapist via `managedByTherapistId`.

Future likely direction:

- tenant-scoped FrontDesk membership
- optionally office assignment
- optionally therapist assignment

### 4. Supabase-backed production invite flow

Still not implemented.

The current staff invite/reset flow is intentionally app-auth-first.

## Files Worth Reading First

If continuing this work in a new chat, start with:

- [README.md](../README.md)
- [USER_IDENTITY_MODEL.md](./USER_IDENTITY_MODEL.md)
- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)
- [TIMEZONE_HANDLING.md](./TIMEZONE_HANDLING.md)
- `prisma/schema.prisma`
- `lib/auth/authorization.ts`
- `lib/config/sidebar.ts`

For FrontDesk specifically:

- `app/api/personnel/route.ts`
- `app/api/personnel/[id]/route.ts`
- `app/api/personnel/[id]/reset-password/route.ts`
- `components/personnel/personnel-page.tsx`

## Operational Note

There are many uncommitted changes in the worktree spanning booking, availability, appointments, navbar, docs, Storybook, and FrontDesk support.

Before doing major new work:

- review `git status`
- decide whether to split or commit the current changes
- be careful not to revert unrelated in-progress UI work
