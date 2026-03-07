# Database Schema

This document reflects the current Prisma schema in [prisma/schema.prisma](../prisma/schema.prisma).

## Overview

The schema is split across five main domains:

- identity and profiles
- locations
- legacy weekly availability
- dated availability
- booking and catalog data

## Tables

### `users`

Stores all application users.

Key responsibilities:

- account identity via `email`
- auth mapping via `supabaseId` or local auth via `passwordHash`
- therapist/admin/patient roles via `role[]`
- public profile data such as `avatar`, `especialidad`, `summary`, and social links
- ownership for therapist bookings and therapist availability

### `locations`

Stores practice locations.

Key responsibilities:

- address, title, description, logo
- timezone per office
- parent entity for bookings and availability

### `specialties`

Stores specialty categories.

### `services`

Stores bookable services under a specialty.

Key responsibilities:

- `description`
- `cost`
- `duration`

### `bookings`

Stores appointments.

Key responsibilities:

- patient contact information and consent
- therapist, patient, specialty, service, and location linkage
- booking date/time and status
- `bookedDurationMinutes`, which stores the effective reserved slot duration used for downstream invite generation

### `availability_periods`

Stores dated availability blocks for a therapist at a location.

Key responsibilities:

- owns a period title, note, start date, and end date
- belongs to exactly one therapist and one location
- parents concrete available days and excluded dates

### `availability_days`

Stores actual bookable days inside an availability period.

Key responsibilities:

- one row per therapist + location + date
- `isAvailable`
- `sessionDurationMinutes`
- per-day notes
- one or more time ranges

### `availability_time_ranges`

Stores one or more time windows for a single available day.

Example:

- `09:00-12:00`
- `14:00-17:00`

### `availability_excluded_dates`

Stores dates that belong to a period range but were intentionally excluded.

Key responsibilities:

- preserves excluded dates as first-class records
- allows a previously excluded day to be restored later
- keeps its own session duration and time ranges for restoration

### `availability_excluded_time_ranges`

Stores time windows attached to an excluded date record.

### `business_hours`

Legacy weekly availability by location and day of week.

This still exists in the schema, but it is no longer the primary source of truth for the newer dated booking flow.

### `time_slots`

Legacy time windows under `business_hours`.

### `date_overrides`

Legacy date exceptions for weekly business hours.

### `override_time_slots`

Legacy time windows attached to `date_overrides`.

## Relationship Summary

- one `user` can be a patient, therapist, admin, or a combination through roles
- one `location` can have many bookings and many availability periods
- one `specialty` has many services
- one `booking` belongs to one location and may reference one therapist, one patient, one specialty, and one service
- one `availability_period` belongs to one therapist and one location
- one `availability_period` has many `availability_days`
- one `availability_period` has many `availability_excluded_dates`
- one `availability_day` has many `availability_time_ranges`
- one `availability_excluded_date` has many `availability_excluded_time_ranges`

## ER Diagram

```mermaid
erDiagram
    users {
        string id PK
        string email UK
        string supabaseId UK
        string firstname
        string lastname
        string passwordHash
        userrole[] role
    }

    locations {
        string id PK
        string title
        string address
        string timezone
    }

    specialties {
        string id PK
        string name
    }

    services {
        string id PK
        string specialtyId FK
        string description
        float cost
        int duration
    }

    bookings {
        string id PK
        string locationId FK
        string specialtyId FK
        string serviceId FK
        string therapistId FK
        string patientId FK
        int bookedDurationMinutes
        datetime bookingSchedule
        bookingstatus status
    }

    availability_periods {
        string id PK
        string therapistId FK
        string locationId FK
        date startDate
        date endDate
        string title
    }

    availability_days {
        string id PK
        string availabilityPeriodId FK
        string therapistId FK
        string locationId FK
        date date
        boolean isAvailable
        int sessionDurationMinutes
    }

    availability_time_ranges {
        string id PK
        string availabilityDayId FK
        string startTime
        string endTime
    }

    availability_excluded_dates {
        string id PK
        string availabilityPeriodId FK
        string therapistId FK
        string locationId FK
        date date
        int sessionDurationMinutes
    }

    availability_excluded_time_ranges {
        string id PK
        string availabilityExcludedDateId FK
        string startTime
        string endTime
    }

    users ||--o{ bookings : patient
    users ||--o{ bookings : therapist
    locations ||--o{ bookings : hosts
    specialties ||--o{ services : groups
    specialties ||--o{ bookings : categorizes
    services ||--o{ bookings : selected_for
    users ||--o{ availability_periods : owns
    locations ||--o{ availability_periods : contains
    availability_periods ||--o{ availability_days : expands_to
    availability_periods ||--o{ availability_excluded_dates : excludes
    availability_days ||--o{ availability_time_ranges : has
    availability_excluded_dates ||--o{ availability_excluded_time_ranges : stores
}
```

## Notes

- The schema now has a foundational `Company` + `CompanyMembership` tenant model, but not every route is fully membership-scoped yet.
- Public booking can resolve the active company from `NEXT_PUBLIC_DEFAULT_COMPANY_SLUG`, with therapist fallback compatibility through `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`.
- The new booking flow uses dated availability, while legacy weekly availability tables still remain in the schema for compatibility.
