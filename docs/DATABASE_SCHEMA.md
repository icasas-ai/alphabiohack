# Database Schema

This document describes the current PostgreSQL schema defined in [prisma/schema.prisma](/Users/davidguillen/Projects/david/alphabiohack/prisma/schema.prisma).

## Table Descriptions

### `users`

Stores application users for all roles: patients, therapists, and admins.

Key responsibilities:

- authentication identity mapping via `supabaseId` or local auth via `passwordHash`
- profile data such as `firstname`, `lastname`, `avatar`, `telefono`, and social links
- therapist-facing public information such as `especialidad`, `summary`, and display hours
- relationship anchor for patient bookings and therapist bookings

### `locations`

Stores practice or clinic locations where appointments can occur.

Key responsibilities:

- address and branding data such as `title`, `address`, `logo`, and `description`
- map coordinates via `lat` and `lon`
- timezone configuration per location
- parent entity for business hours, bookings, and date overrides

### `business_hours`

Stores the weekly availability definition for a location, one row per day of week.

Key responsibilities:

- links a location to a specific `dayOfWeek`
- enables or disables a day using `isActive`
- acts as the parent for one or more `time_slots`

### `time_slots`

Stores one or more time ranges within a `business_hours` record.

Key responsibilities:

- defines opening intervals such as `09:00` to `17:00`
- supports multiple slots per day
- allows individual slots to be enabled or disabled with `isActive`

### `date_overrides`

Stores calendar exceptions for a location across a specific date range.

Key responsibilities:

- handles closures, holidays, or special schedule windows
- marks a range as fully closed with `isClosed`
- provides optional human-readable context through `reason`
- acts as the parent for override-specific time slots when a day is not fully closed

### `override_time_slots`

Stores custom time windows attached to a `date_overrides` record.

Key responsibilities:

- defines special opening times for override days
- allows custom availability instead of normal weekly business hours

### `specialties`

Stores the medical or therapeutic specialty catalog.

Key responsibilities:

- groups services under a specialty
- can be referenced directly by bookings

### `services`

Stores bookable services offered under a specialty.

Key responsibilities:

- defines `description`, `cost`, and `duration`
- belongs to one specialty
- can be attached to bookings

### `bookings`

Stores patient appointments.

Key responsibilities:

- captures patient contact details and consent
- links an appointment to a `location`, optional `specialty`, optional `service`, optional `therapist`, and optional patient `user`
- stores schedule, notes, booking type, and lifecycle status

## ER Diagram

```mermaid
erDiagram
    users {
        string id PK
        string email UK
        string supabaseId UK
        string firstname
        string lastname
        string avatar
        string telefono
        string informacionPublica
        string especialidad
        string summary
        string passwordHash
        string weekdaysHours
        string saturdayHours
        string sundayHours
        string facebook
        string instagram
        string linkedin
        string twitter
        string tiktok
        string youtube
        string website
        userrole[] role
        datetime createdAt
        datetime updatedAt
    }

    locations {
        string id PK
        string address
        string logo
        string title
        string description
        float lat
        float lon
        string timezone
        datetime createdAt
        datetime updatedAt
    }

    business_hours {
        string id PK
        daysofweek dayOfWeek
        string locationId FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    time_slots {
        string id PK
        string startTime
        string endTime
        boolean isActive
        string businessHoursId FK
        datetime createdAt
        datetime updatedAt
    }

    date_overrides {
        string id PK
        string locationId FK
        datetime startDate
        datetime endDate
        boolean isClosed
        string reason
        datetime createdAt
        datetime updatedAt
    }

    override_time_slots {
        string id PK
        string startTime
        string endTime
        boolean isActive
        string dateOverrideId FK
        datetime createdAt
        datetime updatedAt
    }

    specialties {
        string id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    services {
        string id PK
        string description
        float cost
        int duration
        string specialtyId FK
        datetime createdAt
        datetime updatedAt
    }

    bookings {
        string id PK
        bookingtype bookingType
        string locationId FK
        string specialtyId FK
        string serviceId FK
        string firstname
        string lastname
        string phone
        string email
        boolean givenConsent
        string therapistId FK
        string patientId FK
        string bookingNotes
        datetime bookingSchedule
        bookingstatus status
        datetime createdAt
        datetime updatedAt
    }

    locations ||--o{ business_hours : has
    business_hours ||--o{ time_slots : defines
    locations ||--o{ date_overrides : has
    date_overrides ||--o{ override_time_slots : defines
    specialties ||--o{ services : groups
    locations ||--o{ bookings : hosts
    specialties ||--o{ bookings : categorizes
    services ||--o{ bookings : selected_for
    users ||--o{ bookings : patient
    users ||--o{ bookings : therapist
```

## Notes

- Prisma model names map to snake_case database tables through `@@map(...)`.
- `users.passwordHash` is used for local auth mode and can be null for non-local-auth users.
- `bookings.patientId` and `bookings.therapistId` both reference `users.id`, but represent different roles in the same table.
