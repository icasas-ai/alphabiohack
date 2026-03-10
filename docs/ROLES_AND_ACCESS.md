# Roles And Access

This document describes the current role model in the app, which protected pages each role can use, and which API endpoints are currently guarded for those roles.

It reflects the code as it exists today. It is not the future tenant-aware production model.

## Current Roles

Roles are defined in [prisma/schema.prisma](/Users/davidguillen/Projects/david/alphabiohack/prisma/schema.prisma):

- `Patient`
- `FrontDesk`
- `Therapist`
- `Admin`

## Role Intent

### `Patient`

Regular end user / client.

Current intended scope:

- public site
- booking
- own appointments
- own profile

### `FrontDesk`

Therapist staff member.

Current intended scope:

- appointments only
- create appointments on behalf of clients
- edit / reschedule / cancel appointments
- update appointment status
- own profile

Current restriction:

- no access to locations
- no access to availability
- no access to specialties / services
- no access to personnel management

### `Therapist`

Primary tenant operator.

Current intended scope:

- dashboard
- appointments
- specialties / services
- locations
- availability
- personnel management
- own profile

### `Admin`

Internal elevated operator.

Current scope in code:

- everything `Therapist` can do
- can act across therapist-scoped records in guarded API routes

Important:

- `Admin` is not yet a true platform-tenant admin model
- some admin behavior still falls back to the configured default therapist via [lib/auth/authorization.ts](/Users/davidguillen/Projects/david/alphabiohack/lib/auth/authorization.ts)

## Protected Pages

Middleware-level protected routes are configured in [lib/config/routes.ts](/Users/davidguillen/Projects/david/alphabiohack/lib/config/routes.ts).

Protected route prefixes:

- `/protected`
- `/dashboard`
- `/profile`
- `/appointments`
- `/availability`
- `/locations`
- `/specialties`
- `/personnel`

## Page Access Matrix

| Page | Patient | FrontDesk | Therapist | Admin |
| --- | --- | --- | --- | --- |
| `/dashboard` | Yes | Redirects to `/appointments` | Yes | Yes |
| `/appointments` | Yes | Yes | Yes | Yes |
| `/profile` | Yes | Yes | Yes | Yes |
| `/availability` | No | No | Yes | Yes |
| `/locations` | No | No | Yes | Yes |
| `/specialties` | No | No | Yes | Yes |
| `/personnel` | No | No | Yes | Yes |

### Notes

- `Availability`, `Locations`, `Specialties`, and `Personnel` are explicitly gated with [components/auth/role-restricted.tsx](/Users/davidguillen/Projects/david/alphabiohack/components/auth/role-restricted.tsx) for `Therapist` and `Admin`.
- `FrontDesk` is intentionally limited to appointments-only navigation through [lib/config/sidebar.ts](/Users/davidguillen/Projects/david/alphabiohack/lib/config/sidebar.ts).
- If `mustChangePassword` is set, authenticated users are forced through the password update flow by [app/[locale]/(protected)/layout.tsx](/Users/davidguillen/Projects/david/alphabiohack/app/[locale]/(protected)/layout.tsx) before accessing protected pages.

## Auth Helpers

Current role checks live in [lib/auth/authorization.ts](/Users/davidguillen/Projects/david/alphabiohack/lib/auth/authorization.ts).

Important helpers:

- `canAccessAvailability(user)`
  - `Admin` or `Therapist`
- `canOperateAppointments(user)`
  - `Admin`, `Therapist`, or `FrontDesk`
- `canManagePersonnel(user)`
  - `Admin` or `Therapist`
- `getManagedTherapistId(user)`
  - `Therapist`: own `id`
  - `FrontDesk`: `managedByTherapistId`
  - `Admin`: configured default therapist fallback
- `canManageBookingAsOperator(user, therapistId)`
  - `Admin`: always
  - `Therapist`: only own therapist bookings
  - `FrontDesk`: only bookings under managed therapist

## API Access Matrix

This section focuses on the role-guarded application API routes that matter most for operations.

### Availability API

These routes are guarded for `Therapist` and `Admin` only.

| Endpoint | Method | Patient | FrontDesk | Therapist | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/availability/periods` | `GET` | No | No | Yes | Yes | Therapist only sees own records unless admin requests another therapist. |
| `/api/availability/periods` | `POST` | No | No | Yes | Yes | Therapist can only create own periods. |
| `/api/availability/periods/[id]` | `DELETE` | No | No | Yes | Yes | Ownership checked against period therapist. |
| `/api/availability/periods/[id]` | `POST` | No | No | Yes | Yes | Used for `restore-excluded-date`. Ownership checked. |
| `/api/availability/days/[id]` | `PUT` | No | No | Yes | Yes | Ownership checked against day therapist. |

Guarding files:

- [app/api/availability/periods/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/availability/periods/route.ts)
- [app/api/availability/periods/[id]/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/availability/periods/[id]/route.ts)
- [app/api/availability/days/[id]/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/availability/days/[id]/route.ts)

### Appointment Read API

These reads are consolidated under `/api/bookings` using `scope`.

| Endpoint | Method | Patient | FrontDesk | Therapist | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/bookings?scope=self` | `GET` | Own bookings | No | No | No | Uses the authenticated user's email. |
| `/api/bookings?scope=managed` | `GET` | No | Managed therapist bookings | Own therapist bookings | Yes | Uses managed therapist resolution for operator context. |

Guarding file:

- [app/api/bookings/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/bookings/route.ts)

### Booking Detail and Update API

These routes are shared between patient and operator flows.

| Endpoint | Method | Patient | FrontDesk | Therapist | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/bookings/[id]` | `GET` | Own booking only | Managed therapist only | Own therapist bookings only | Yes | Patient access is by booking email match. |
| `/api/bookings/[id]` | `PUT` | Own booking only | Managed therapist only | Own therapist bookings only | Yes | Reschedule/update allowed if slot remains valid. |
| `/api/bookings/[id]` | `DELETE` | Own booking only | Managed therapist only | Own therapist bookings only | Yes | Hard delete endpoint. |
| `/api/bookings/[id]/status` | `PUT` | Cancel own active booking only | Managed therapist only | Own therapist bookings only | Yes | Operators can move between statuses; patients can only cancel active appointments. |

Guarding files:

- [app/api/bookings/[id]/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/bookings/[id]/route.ts)
- [app/api/bookings/[id]/status/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/bookings/[id]/status/route.ts)

### Personnel API

These routes are guarded for `Therapist` and `Admin` only.

| Endpoint | Method | Patient | FrontDesk | Therapist | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/personnel` | `GET` | No | No | Yes | Yes | Lists `FrontDesk` users for the managed therapist. |
| `/api/personnel` | `POST` | No | No | Yes | Yes | Creates a `FrontDesk` user and sends a temporary-password invite email. |
| `/api/personnel/[id]` | `PATCH` | No | No | Yes | Yes | Updates personnel record owned by managed therapist. |
| `/api/personnel/[id]` | `DELETE` | No | No | Yes | Yes | Deletes personnel record owned by managed therapist. |
| `/api/personnel/[id]/reset-password` | `POST` | No | No | Yes | Yes | Resends a temporary-password email. |

Guarding files:

- [app/api/personnel/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/personnel/route.ts)
- [app/api/personnel/[id]/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/personnel/[id]/route.ts)
- [app/api/personnel/[id]/reset-password/route.ts](/Users/davidguillen/Projects/david/alphabiohack/app/api/personnel/[id]/reset-password/route.ts)

### App Auth Support Routes

These are auth flow routes, not business-role routes, but they matter for staff onboarding.

| Endpoint | Method | Notes |
| --- | --- | --- |
| `/api/auth/app/login` | `POST` | App auth sign-in. Returns `mustChangePassword` when applicable. |
| `/api/auth/app/update-password` | `POST` | Used for forced first-login password change. |
| `/api/auth/app/me` | `GET` | Returns current app-auth user/session state. |

## Public / Anonymous Access

Anonymous users can access the public website and booking flow.

Main public routes:

- `/`
- `/contact`
- `/booking`
- `/auth/login`

Important:

- `auth/sign-up` is a public self-service path for patient accounts
- the app now has a foundational `Company` + `CompanyMembership` model, but role enforcement is still mid-transition from global roles to company-scoped membership rules

## Current Caveats

### 1. Tenant Foundation Exists, But Enforcement Is Still In Transition

The current access model is still primarily role-based, while company-aware enforcement is being rolled out.

That means:

- role checks are mostly global
- therapist ownership is inferred through `therapistId` and `managedByTherapistId`
- `Admin` still relies on a configured default therapist fallback in some flows

For the production-ready direction, see [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md).

### 2. `FrontDesk` Is Therapist-Owned

`FrontDesk` is currently modeled as therapist staff, not as a tenant-wide staff membership model.

Current linkage:

- `User.role` includes `FrontDesk`
- `User.managedByTherapistId` points to the therapist user

This is enough for the current app, but the long-term production-ready model should move to explicit tenant membership and optional therapist/location assignments.

### 3. Personnel Invite / Reset Uses App-Managed Auth

The personnel invite and temporary-password email flow now uses the app-managed auth system.

That keeps staff onboarding inside the product, but the long-term production-ready direction should still move from reusable temporary passwords to expiring invite/reset links.

### 4. Some Generic Routes Are Broader Than The UI

The UI and sidebar intentionally restrict what `FrontDesk` sees, but the underlying generic auth model still allows authenticated access to some broader surfaces unless page/API guards are present.

When changing or adding routes, always verify:

- page access
- API access
- sidebar visibility
- action-level permission checks

## Related Docs

- [docs/USER_IDENTITY_MODEL.md](docs/USER_IDENTITY_MODEL.md)
- [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md)
- [docs/HANDOFF_CONTEXT.md](docs/HANDOFF_CONTEXT.md)
