# Availability System

This document describes the current availability architecture.

## Current Model

The platform now has two availability models in the codebase:

1. legacy weekly availability
2. dated therapist availability

The newer booking flow is designed around the dated model.

## Primary Booking Model

The active dated model is based on:

- `therapist + location + date`
- one or more time ranges for each day
- per-day session duration
- real booking collision checks

Core tables:

- `availability_periods`
- `availability_days`
- `availability_time_ranges`
- `availability_excluded_dates`
- `availability_excluded_time_ranges`

Core service:

- [services/availability.service.ts](../services/availability.service.ts)

Primary APIs:

- [app/api/availability/periods/route.ts](../app/api/availability/periods/route.ts)
- [app/api/availability/periods/[id]/route.ts](../app/api/availability/periods/[id]/route.ts)
- [app/api/availability/days/[id]/route.ts](../app/api/availability/days/[id]/route.ts)
- [app/api/availability/calendar/route.ts](../app/api/availability/calendar/route.ts)

Primary admin UI:

- [components/availability/availability-page.tsx](../components/availability/availability-page.tsx)

## Admin Workflow

The `/availability` page is used to manage real booking inventory.

Current workflow:

1. select location
2. create an availability period
3. choose a start and end date
4. optionally exclude dates inside the range
5. define one or more time ranges
6. set the day session duration
7. optionally customize individual days
8. review availability by month

Important behavior:

- the page derives the active therapist from the authenticated user
- the therapist is not selected manually in the current admin flow
- excluded dates are persisted and can be added back later
- overlapping periods can span multiple months

## Booking Relationship

The booking wizard reads dated availability for:

- therapist
- location
- month
- selected date

Flow:

1. booking selects or resolves the active therapist
2. customer chooses location and service
3. the app loads available days from dated availability
4. the app loads available time slots for the selected day
5. the server re-validates the selected slot before saving the booking

The effective slot duration comes from the availability day and is persisted to the booking as `bookedDurationMinutes`.

## Excluded Dates vs Closed Days

These are different concepts.

### Excluded date

- date is intentionally omitted from the period
- stored in `availability_excluded_dates`
- can be restored later

### Closed day

- the day still exists in the period
- `isAvailable` is set to `false`
- it remains part of the saved day list but is not bookable

## Legacy Weekly Model

Legacy tables still exist:

- `business_hours`
- `time_slots`
- `date_overrides`
- `override_time_slots`

These are older location-first scheduling primitives.

They are still part of the schema and some older code paths, but they are not the preferred model for the newer therapist/location/date-based booking flow.

## Authorization

Availability APIs are protected so only:

- the owning therapist
- or an admin

can list or mutate therapist availability records.

## Open Architectural Gap

The app still lacks a true tenant/public profile model. Public booking resolves therapist identity from `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`, while other public pages still need to be unified under the same source of truth.

That is the main next architectural step if the product is moving toward one subdomain per therapist or office.