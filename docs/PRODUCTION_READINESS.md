# Production Readiness

This document describes what needs to change to take AlphaBioHack from its current single-therapist / local-auth-friendly shape into a production-ready multi-tenant platform.

It focuses on:

- tenant-aware architecture
- therapist and FrontDesk staff management
- authentication and invitation flow
- authorization and data isolation
- operational and security hardening

## Current State

The app is already usable as a therapist booking and operations system, but it still has architectural shortcuts that are acceptable in local development and early rollout, not at scale.

Main current limitations:

- no first-class `Tenant` model yet
- public booking still depends on a configured default therapist in some paths
- FrontDesk is now supported, but ownership is still therapist-driven rather than tenant-driven
- the invite / temporary-password flow is implemented for local auth only
- some public identity resolution still needs to be unified

## Production Target

The production target should be:

- one platform
- many tenants
- each tenant owns its own therapists, offices, staff, services, and bookings
- public website and booking resolve from tenant context, not from a global default therapist

That means moving from a user-centric model to a tenant-centric model.

## 1. Add A Real Tenant Model

Do not model a tenant as “the therapist user”.

A tenant is the business boundary:

- solo therapist practice
- clinic brand
- therapist group
- multi-office organization

Recommended core model:

### `Tenant`

- `id`
- `name`
- `slug`
- `status`
- `brandName`
- `publicDomain`
- `defaultTimeZone`
- `createdAt`
- `updatedAt`

### Why

This becomes the root owner of:

- locations
- therapists
- front desk staff
- services
- specialties
- availability
- bookings
- public profile / branding

## 2. Add Tenant Memberships

Do not keep long-term authorization only on `User.role`.

Global user identity and tenant membership should be separated.

### `User`

Keep `User` as platform identity:

- email
- auth-provider id
- profile fields

### `TenantMembership`

Add:

- `id`
- `tenantId`
- `userId`
- `role`
- `status`
- `createdAt`
- `updatedAt`

Recommended tenant-scoped roles:

- `Owner`
- `Therapist`
- `FrontDesk`
- optionally `Manager`

### Why

This allows a single person to:

- be a therapist in one tenant
- be front desk in another tenant
- have no access elsewhere

That is not modeled cleanly with a global role array alone.

## 3. Scope Core Data By Tenant

The following entities should become explicitly tenant-owned:

- `Location`
- `Specialty`
- `Service`
- `AvailabilityPeriod`
- `AvailabilityDay`
- `AvailabilityExcludedDate`
- `Booking`

Each should have `tenantId`.

### Why

This enables:

- strict tenant isolation
- simpler authorization checks
- safer queries
- cleaner public-site resolution

## 4. Public Booking Must Resolve From Tenant Context

The long-term production flow should not be:

- “who is the default therapist?”

It should be:

1. request arrives on subdomain or mapped domain
2. resolve request to `Tenant`
3. load public profile, offices, therapists, and services only for that tenant

Examples:

- `chicago.example.com`
- `clinic-a.example.com`
- custom branded domain later

### Needed pieces

- `Tenant.slug` or domain mapping
- middleware or server-side resolver
- tenant-scoped public profile service

### Result

Public home, contact, and booking all use the same tenant source of truth.

## 5. Keep FrontDesk As Staff, Not Admin

`FrontDesk` should remain:

- therapist employee
- office staff
- appointments-only operator

They should be able to:

- view appointments
- create appointments on behalf of clients
- edit participant details
- reschedule
- cancel
- update appointment status

They should not be able to:

- manage specialties
- manage locations
- manage availability
- manage tenant settings
- create other staff

### Current direction

The current implementation is aligned with that product intent and should stay that way.

## 6. Add Therapist-To-Staff And Optional Office Assignment

Once tenants exist, you need to decide how granular staff scope should be.

### Option A: Tenant-wide FrontDesk access

FrontDesk staff can manage all appointments in the tenant.

Best for:

- small clinics
- shared receptionist
- simpler initial production launch

### Option B: Granular assignment

Add optional assignment models:

#### `TherapistStaffAssignment`

- `therapistMembershipId`
- `staffMembershipId`

#### `StaffLocationAssignment`

- `staffMembershipId`
- `locationId`

Best for:

- multi-therapist clinics
- offices with separate staff teams
- stricter scheduling scope

### Recommended rollout

Start with tenant-wide FrontDesk permissions, then add therapist and/or office assignment later.

## 7. Replace Temporary Password Emailing In Production

The current local-auth staff invite flow works for development, but it should not be the production pattern.

Production-ready invitation should be:

- secure invite link
- password-set link
- one-time onboarding action
- forced password creation by the staff user

Avoid:

- emailing reusable plaintext passwords in production

### Recommended production approach

Use Supabase Auth (or your real auth provider) for staff accounts too.

Flow:

1. therapist creates FrontDesk user in app
2. backend creates auth account
3. backend creates Prisma membership/profile
4. backend sends invite/reset link
5. staff sets password on first login

## 8. Build A Staff Provisioning Service

Do not keep invite logic spread across route handlers.

Add a proper auth/personnel provisioning layer with methods like:

- `createStaffAccount`
- `sendStaffInvite`
- `resendStaffInvite`
- `forcePasswordReset`
- `disableStaffAccount`
- `removeStaffAccount`

This service should abstract:

- local-auth dev flow
- Supabase production flow

### Why

This keeps the UI stable even if the auth backend changes.

## 9. Use Prisma As The Source Of Truth For Authorization

The auth provider should handle identity.

Prisma should remain the source of truth for:

- tenant membership
- therapist ownership
- office assignment
- role permissions
- active/inactive access

### Why

You need application-specific authorization that auth providers do not model well on their own.

## 10. Add Account Lifecycle Controls

Production-ready staff management should support:

- create/invite
- resend invite
- password reset
- deactivate/suspend
- remove access
- audit history

Recommended staff account states:

- `Invited`
- `Active`
- `Suspended`
- `Removed`

These can live on membership or staff profile records.

## 11. Add Auditability

Production systems should record who did what.

At minimum, log:

- who created staff
- who changed appointment status
- who rescheduled a booking
- who deleted or deactivated a staff member
- who changed tenant settings

Recommended later:

- audit log table
- timestamp
- actor user id
- tenant id
- entity type
- entity id
- action
- metadata

## 12. Tighten Route And Query Security

Every protected route and API should become tenant-aware.

Authorization checks should look like:

1. authenticate user
2. resolve tenant membership
3. verify role
4. verify resource belongs to the same tenant
5. optionally verify office or therapist assignment

Avoid:

- checking only a global role
- loading resources without tenant scope
- public routes using `findFirst(user)` style fallbacks

## 13. Make Dashboard And Navigation Tenant-Aware

Once tenants exist:

- dashboard should load tenant-scoped data
- FrontDesk should see appointments-only navigation
- Therapist should see operations/configuration pages
- Platform admin should have a separate app area, not tenant navigation

This means eventually separating:

- platform admin app
- tenant operator app
- public site

## 14. Add A Platform Admin Area

This is separate from FrontDesk.

Platform admin responsibilities should include:

- create tenant
- create first therapist / owner membership
- manage subscription/billing later
- suspend tenant
- view platform-wide health

This should not be mixed into the tenant-side dashboard.

## 15. Recommended Data Model Direction

High-level production-ready direction:

### Add

- `Tenant`
- `TenantMembership`
- `tenantId` on tenant-owned resources

### Keep

- `User` for identity

### Later optionally add

- `TherapistStaffAssignment`
- `StaffLocationAssignment`
- `AuditLog`
- `TenantDomain`

## 16. Recommended Rollout Plan

### Phase 1: Tenant Foundation

- add `Tenant`
- add `TenantMembership`
- add `tenantId` to core resources
- backfill existing data into one seed tenant

### Phase 2: Authorization Refactor

- move access checks from global roles to membership roles
- scope queries by tenant

### Phase 3: Public Identity Refactor

- resolve public site by tenant slug/domain
- stop using default therapist fallback

### Phase 4: Production Staff Provisioning

- replace temp-password email flow with invite link flow
- build tenant-aware staff management on top of real auth provider

### Phase 5: Granular Assignment

- therapist assignment
- office assignment
- advanced operator permissions

## 17. Short-Term Production Checklist

Before calling this production-ready, the app should have:

- tenant model
- tenant-scoped memberships
- tenant-scoped public booking
- secure invite flow for staff
- no plaintext password emailing in production
- tenant-aware authorization checks
- platform admin flow to create tenants/therapists
- audit log for staff and booking operations
- route and query isolation by tenant

## 18. What Can Stay As-Is For Local Development

These are still useful for local/dev workflows:

- local auth
- temporary-password staff invite flow
- default therapist fallback for quick local testing
- Mailpit delivery for invites

They are fine for development, but they should be treated as development behavior, not final production architecture.

## 19. Recommended Next Engineering Step

If you want to start the production transition in the current codebase, the best next step is:

1. add `Tenant`
2. add `TenantMembership`
3. add `tenantId` to `Location`, `Booking`, `Availability*`, and `Specialty`
4. update authorization to use membership instead of only `User.role`

That change unlocks nearly everything else.
