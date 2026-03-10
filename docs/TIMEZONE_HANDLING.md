# Timezone Handling

This document explains the current timezone model used by MyAlphaPulse.

## Source Of Truth

Timezone belongs to the office/location, not the customer.

Rules:

- booking slot selection is always interpreted in `Location.timezone`
- booking times are persisted in UTC (`bookingSchedule`)
- availability checks and conflict checks are done in office-local time
- UI must show timezone context when displaying bookable times

## Timezone Resolution

Primary field:

- `Location.timezone`

Schema defaults:

- `Location.timezone` default: `America/Los_Angeles`
- `Company.defaultTimezone` default: `America/Los_Angeles`

Resolution helper:

- [lib/utils/timezone.ts](../lib/utils/timezone.ts)
- `resolveTimeZone(timeZone)` returns the provided IANA timezone or app default

App default:

- `NEXT_PUBLIC_DEFAULT_TIMEZONE` (if set)
- otherwise `America/Los_Angeles`

## Booking Pipeline

1. User selects office, date, and hour in office-local time.
2. Client converts office-local `date + HH:mm` to UTC ISO.
3. API validates slot availability in office-local context.
4. Booking is stored in UTC.
5. Reads return office-local fields for display.

Main code:

- [lib/utils/booking-request.ts](../lib/utils/booking-request.ts)
- [app/api/bookings/route.ts](../app/api/bookings/route.ts)
- [services/booking.service.ts](../services/booking.service.ts)
- [services/availability.service.ts](../services/availability.service.ts)

Core conversion:

- `combineDateAndTimeToUtc(date, timeHHmm, timezone)`

## Guardrails

Creating/editing booking time requires a location timezone.

If office timezone is missing:

- booking creation/edit is blocked in UI
- API request building fails with `validation.location_timezone_required`

Relevant UI:

- [components/bookings/create-booking-dialog.tsx](../components/bookings/create-booking-dialog.tsx)
- [components/bookings/edit-booking-dialog.tsx](../components/bookings/edit-booking-dialog.tsx)
- [components/booking/date-time-selector.tsx](../components/booking/date-time-selector.tsx)

## Response Fields For Rendering

Booking read mapping includes:

- `bookingSchedule` (UTC ISO source)
- `bookingLocalDate` (`YYYY-MM-DD` in office timezone)
- `bookingLocalTime` (`HH:mm` in office timezone)
- `bookingTimeZone` (resolved office timezone)

Code:

- [services/booking.service.ts](../services/booking.service.ts)
- [lib/utils/calendar.ts](../lib/utils/calendar.ts)

## Dashboard Behavior

Therapist dashboard range and grouping now resolve timezone context and avoid hardcoded PST.

What it returns:

- appointment `date` and `time` already localized to office timezone
- `timeZone` for explicit UI labeling

Code:

- [app/api/dashboard/therapist/route.ts](../app/api/dashboard/therapist/route.ts)
- [components/dashboard/therapist-dashboard.tsx](../components/dashboard/therapist-dashboard.tsx)
- [hooks/use-therapist-dashboard.ts](../hooks/use-therapist-dashboard.ts)

## Invites And Calendar Links

Email/ICS/Google Calendar artifacts use the resolved office timezone for display and event metadata.

Code:

- [services/calendar.service.ts](../services/calendar.service.ts)
- [lib/utils/calendar-links.ts](../lib/utils/calendar-links.ts)
- [app/api/bookings/route.ts](../app/api/bookings/route.ts)

## Practical Example

- Office timezone: `America/New_York`
- Customer browser timezone: `America/Tijuana`
- User picks `Friday, 09:00`

System behavior:

- `09:00` is interpreted as New York time
- stored as UTC in `bookingSchedule`
- availability/collision checks compare using New York-local date/time
- UI and invite explicitly indicate New York timezone

## Future-safe Rule

If customer-local display is ever added, keep it secondary.

Do not use viewer timezone as slot source of truth.
