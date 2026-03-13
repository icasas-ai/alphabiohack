# Client Domain Launch README

Use this checklist when you want to launch a new domain for a new client.

Important:

- this app is currently `one public client per deployment`
- a new client domain should be treated as a new deployment/site
- public site resolution currently depends on `DEFAULT_COMPANY_SLUG`, not on automatic domain-to-tenant mapping

Related docs:

- [DEPLOY_NETLIFY_SUPABASE.md](/Users/davidguillen/Projects/david/alphabiohack/docs/DEPLOY_NETLIFY_SUPABASE.md)
- [ENVIRONMENT_VARIABLES.md](/Users/davidguillen/Projects/david/alphabiohack/docs/ENVIRONMENT_VARIABLES.md)
- [COMPANY_MODEL.md](/Users/davidguillen/Projects/david/alphabiohack/docs/COMPANY_MODEL.md)
- [USER_IDENTITY_MODEL.md](/Users/davidguillen/Projects/david/alphabiohack/docs/USER_IDENTITY_MODEL.md)

## 1. What You Need To Gather First

Before creating the new deployment, collect these items from the client.

### Business identity

- company or practice name
- company slug
- primary admin / owner name
- primary admin / owner email
- default timezone
- public phone number
- public email
- public address or locations

### Public booking identity

- which therapist will be the public-facing therapist
- whether booking should stay in single-therapist mode or support therapist selection

Important:

- the company must have a valid `publicTherapistId`
- that user must have the `Therapist` role
- that user must belong to the company

### Branding and content

- logo
- optional header logo
- preferred primary color
- preferred accent color
- homepage/public site content
- contact content
- business hours
- social links

### Operations and team

- therapist users to create
- front desk users to create
- whether front desk should be assigned to one therapist or all therapists
- initial specialties
- initial services
- initial locations
- initial availability

### Domain and email

- final production domain or subdomain
- DNS access
- verified sending domain or subdomain for email
- reply-to inbox
- optional BCC/archive inbox

## 2. Infrastructure To Prepare

For a new client launch, prepare a dedicated environment.

- create a new Netlify site
- create a new Supabase project/database
- generate a new `APP_AUTH_SECRET`
- decide the final `SITE_URL`
- configure the custom domain in Netlify
- point DNS records

Recommended:

- use a separate Supabase project per client
- use a separate Netlify site per client
- do not share demo data or demo secrets with real client environments

## 3. Environment Variables To Set

Minimum recommended production variables:

```env
SITE_URL=https://your-client-domain.com

DB_USER=postgres.[project-ref]
DB_PASS=...
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_QUERY=pgbouncer=true&sslmode=require&uselibpqcompat=true

APP_AUTH_SECRET=replace-with-a-strong-random-secret

DEFAULT_COMPANY_SLUG=your-company-slug

EMAIL_PROVIDER=resend
RESEND_API_KEY=...
BOOKING_FROM_EMAIL="Client Name <noreply@yourdomain.com>"
BOOKING_REPLY_TO=support@yourdomain.com
```

Optional:

- `BOOKING_EMAIL_BCC`
- `NEXT_PUBLIC_BOOKING_FROM_EMAIL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

## 4. Bootstrap The Client Company

This repository includes a production bootstrap seed.

Typical bootstrap inputs:

```env
BOOTSTRAP_OWNER_EMAIL=owner@yourdomain.com
BOOTSTRAP_OWNER_PASSWORD=replace-with-a-strong-random-password
BOOTSTRAP_COMPANY_NAME="Client Practice"
DEFAULT_COMPANY_SLUG=client-practice
```

Then run the production setup flow against the production env file:

```bash
MYALPHAPULSE_ENV_FILE=./.env.production npm run db:generate
MYALPHAPULSE_ENV_FILE=./.env.production npm run db:migrate:deploy
MYALPHAPULSE_ENV_FILE=./.env.production npm run db:seed:prod
```

What this should leave in place:

- owner/admin user exists
- company exists
- company slug matches `DEFAULT_COMPANY_SLUG`
- owner membership exists
- `publicTherapistId` is set

## 5. Configure The App Data

Once the environment is running, complete the in-app setup.

### Company profile

- review company name
- review slug
- review public phone/email
- review public summary/description
- review timezone
- upload logos
- configure shared color palette

### Team

- create therapists
- create front desk users
- verify admin can access personnel and locations
- verify therapist access
- verify front desk access

### Booking setup

- create specialties
- create services
- create locations
- configure availability
- confirm which therapist is public-facing

## 6. Pre-Launch QA Checklist

Run this before pointing traffic.

### Public site

- [ ] homepage loads with correct branding
- [ ] theme colors are applied after refresh
- [ ] contact page shows correct information
- [ ] footer links and social links are correct

### Booking flow

- [ ] public booking loads correctly
- [ ] correct therapist appears in the public booking flow
- [ ] services and availability show correctly
- [ ] a test booking can be completed
- [ ] booking email is delivered

### Internal app

- [ ] admin can log in
- [ ] therapist can log in
- [ ] front desk can log in
- [ ] admin can manage personnel
- [ ] admin can manage locations
- [ ] therapist/front desk can view expected bookings

### Email

- [ ] booking confirmation email works
- [ ] invite/reset email works
- [ ] sender domain is verified
- [ ] reply-to inbox is correct

## 7. Launch Day Checklist

- [ ] production deploy completed
- [ ] SSL is active on the domain
- [ ] public homepage smoke-tested
- [ ] public booking smoke-tested
- [ ] internal login smoke-tested
- [ ] email delivery smoke-tested
- [ ] first admin handoff completed

## 8. Handoff Package

When you hand the project to the client, include:

- production URL
- admin login URL
- initial admin email
- password handoff method
- booking URL
- support contact for launch week
- summary of what was configured

## 9. Recommended Internal Launch Packet

For each new client, keep a simple internal record with:

- client name
- deployment/site name
- production URL
- company slug
- Supabase project name
- Netlify site name
- sending domain
- public therapist
- launch date
- owner/admin contact

## 10. Current Architectural Limitation

Today this app does not yet resolve tenant identity from domain or subdomain automatically.

That means:

- new client domain = new deployment/config
- public identity is selected by `DEFAULT_COMPANY_SLUG`
- public booking/profile resolve through that company's `publicTherapistId`

If the product later moves to true multi-tenant domain routing, this checklist should be updated to include domain-to-tenant mapping instead of one deployment per client.
