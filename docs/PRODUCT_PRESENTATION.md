# MyAlphaPulse Product Presentation

Prepared from:
- route and component audit
- local UI review on March 9, 2026
- current feature flags and deployment model

## 1. Product Snapshot

MyAlphaPulse is a therapist booking and practice operations platform built around one branded public site and one internal workspace per deployment.

Core shape today:
- public landing page
- public contact page
- guided booking wizard
- internal operations workspace
- company-managed branding and landing-page content
- app-managed users, sessions, and password reset
- Supabase Postgres and optional Storage as infrastructure only

## 2. Who It Serves

Primary users:
- patients and prospective clients
- therapist owners
- front desk staff
- internal practice operators

Best-fit deployment model today:
- one Netlify site per practice or therapist
- one company per database
- one branded public experience per deployment

## 3. Public Experience

Shipped public flows:
- localized home page (`en-US`, `es-MX`)
- localized contact page
- booking entry point with location preselection
- appointment-summary email request from contact
- login, sign-up, forgot-password, update-password
- graceful public splash when company setup is unavailable

Strength:
- polished branded experience with strong visual consistency

## 4. Booking Experience

Current booking flow:
1. appointment type
2. service selection
3. date and time selection
4. basic information
5. confirmation

Key product behaviors:
- therapist and location aware slot selection
- dated availability periods with time ranges
- phone-first lookup helper in basic information
- safe patient linking by exact email only
- automatic patient record creation when needed

## 5. Internal Workspace

Current protected product areas:
- dashboard
- bookings
- availability
- locations
- specialties and services
- personnel
- company settings
- profile

Value:
- enough operational surface for a small practice to manage bookings, staff, availability, and public-facing content in one app

## 6. Branding and Content Control

Current company controls include:
- logos and header branding
- public contact details and hours
- social links
- landing-page section builder
- localized landing copy editing by route locale
- live preview and modal preview for landing changes

Product implication:
- the app already acts like a lightweight website manager, not only a booking tool

## 7. Architecture and Operations

Current architecture:
- Next.js 15 app router
- Prisma ORM
- PostgreSQL
- app-managed auth and password reset
- Supabase Postgres for DB hosting
- optional Supabase Storage for uploads
- Netlify hosting

Important product constraint:
- current production model is intentionally single-company per deployment

## 8. Demo Readiness

Current demo support:
- realistic demo seed
- polished named practice and users
- realistic locations and services
- upcoming availability and booking history
- localized public experience

Commands:
- `npm run db:seed:demo`
- `npm run db:reset -- --demo`

Demo company:
- `harbor-balance-wellness`

Shared password:
- `HarborDemo123!`

## 9. Roles And Access

Current application roles:
- `Patient`
- `FrontDesk`
- `Therapist`
- `Admin`

What they do today:
- `Patient`: public site, booking, own appointments, own profile
- `FrontDesk`: appointment operations for the managed therapist, own profile
- `Therapist`: dashboard, bookings, availability, specialties, locations, personnel, profile
- `Admin`: broad internal operator access across therapist-managed areas

Important nuance:
- the database also has company membership roles: `Owner`, `Therapist`, `FrontDesk`, `Patient`
- `Owner` is a company membership role, not a separate application role

## 10. Positioning

Best product positioning today:
- booking and operations platform for a modern solo therapist or small practice
- combines public website, booking conversion, availability control, and internal practice operations

Not yet positioned as:
- enterprise multi-tenant clinic platform
- telehealth-heavy workflow suite
- payments-first scheduling SaaS
