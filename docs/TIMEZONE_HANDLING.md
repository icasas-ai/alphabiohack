# Timezone Handling

This document explains how timezone works in AlphaBioHack for locations, availability, booking, and email/calendar invites.

## Summary

The system treats appointment times as belonging to the selected office/location.

That means:

- each office stores its own timezone
- customers book using the office's local time
- bookings are saved in UTC
- availability checks are done against the office timezone
- confirmation emails and calendar invites use the office timezone

Example:

- office in Chicago: `America/Chicago`
- customer in California
- customer selects `10:00 AM`

That selection is interpreted as `10:00 AM Chicago time`, then converted to UTC for storage.

## Where Timezone Is Stored

Timezone is stored on the `locations` table:

- [prisma/schema.prisma](../prisma/schema.prisma)

Field:

- `Location.timezone`

Current default:

- `America/Los_Angeles`

## How Location Timezone Is Set

Location timezone is usually derived from latitude and longitude in:

- [services/location.service.ts](../services/location.service.ts)

If `lat` and `lon` are present, the app uses `tz-lookup` to calculate the IANA timezone string, for example:

- `America/Chicago`
- `America/Los_Angeles`
- `America/New_York`

If timezone cannot be resolved, the app falls back to:

- `America/Los_Angeles`

Fallback helpers live in:

- [lib/utils/timezone.ts](../lib/utils/timezone.ts)
- [services/config.service.ts](../services/config.service.ts)

## Booking Behavior

When a customer books:

1. they select a location
2. the system loads availability for that therapist + location
3. available slots are generated in the office timezone
4. the selected local office time is converted to UTC before saving

Main code paths:

- [services/availability.service.ts](../services/availability.service.ts)
- [services/booking.service.ts](../services/booking.service.ts)
- [app/api/bookings/route.ts](../app/api/bookings/route.ts)

The key conversion happens in:

- [lib/utils/timezone.ts](../lib/utils/timezone.ts)

Function:

- `combineDateAndTimeToUtc(date, timeHHmm, tz)`

This means the stored booking is normalized, but the booking logic still honors the office's local time rules.

## Availability Behavior

Availability is calculated in the selected office timezone.

This affects:

- which dates are considered bookable
- which times are generated for a day
- whether an existing booking collides with a slot

Main code:

- [services/availability.service.ts](../services/availability.service.ts)

Important behavior:

- booked appointments are converted back into office-local date/time strings before collision checks
- day slot generation uses the office timezone when comparing booked times

## What The Customer Sees

The booking flow now shows a timezone notice in the UI so customers know all times are shown in the office's local time.

Relevant UI:

- [components/booking/date-time-selector.tsx](../components/booking/date-time-selector.tsx)
- [components/booking/basic-information-form.tsx](../components/booking/basic-information-form.tsx)
- [components/booking/booking-confirmation.tsx](../components/booking/booking-confirmation.tsx)

The displayed label is based on the selected location timezone, for example:

- `Central Time (America/Chicago)`
- `Pacific Time (America/Los_Angeles)`

## Email Confirmation And Calendar Invites

Booking confirmation emails and calendar invite artifacts also use the office timezone.

Relevant code:

- [app/api/bookings/route.ts](../app/api/bookings/route.ts)
- [services/calendar.service.ts](../services/calendar.service.ts)
- [emails/appointment-invite.tsx](../emails/appointment-invite.tsx)
- [lib/utils/calendar-links.ts](../lib/utils/calendar-links.ts)

Current behavior:

- email body shows the appointment time in the office timezone
- email body now also explicitly shows the timezone label
- Google Calendar link includes the office timezone
- ICS invite is generated with the office timezone

## Data Model Rule

The important rule is:

- timezone belongs to the office/location, not the customer

So the scheduling system is office-local first.

This is the correct behavior for:

- multi-office practices
- traveling practitioners
- customers booking from different states or countries

## Current Limitation

The system currently does not let the customer switch the booking UI into their own local timezone.

That means:

- slot logic is correct for the office
- customer communication is clearer than before
- but all displayed booking times are still office-local, not viewer-local

If that becomes a future requirement, the safest product approach is:

- keep booking logic in office-local time
- optionally show a secondary viewer-local conversion for convenience
- do not make viewer-local time the source of truth for slot selection
