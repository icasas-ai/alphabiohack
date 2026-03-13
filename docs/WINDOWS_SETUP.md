# Windows Setup

This guide is for running MyAlphaPulse on a Windows machine using:

- Docker Desktop for infrastructure
- PowerShell for commands
- the Next.js app on your host machine

This is the recommended Windows workflow because it avoids Docker rebuilds during normal app development.

## What You Need To Install

Install these first:

1. Node.js 20+
   - Download from: `https://nodejs.org`
   - Use the LTS version

2. Docker Desktop
   - Download from: `https://www.docker.com/products/docker-desktop/`

3. Git
   - Download from: `https://git-scm.com/download/win`

Optional but useful:

- VS Code
- Prisma Studio in the browser

## Recommended Windows Workflow

Use this split:

- Docker Desktop runs:
  - PostgreSQL
  - Mailpit
- Windows host runs:
  - Next.js app

That gives you:

- faster file watching
- no image rebuild for normal code edits
- local email testing

## Important Note About Shell Scripts

This repo includes some helper scripts that use `sh`, for example:

- `npm run db:generate`
- `npm run db:migrate:deploy`
- `npm run db:migrate:status`
- `npm run db:studio`

Those wrappers are convenient on macOS/Linux, but they are not native PowerShell commands.

On Windows, use the direct Prisma commands shown below instead of those wrapper scripts.

## 1. Create Environment Files

Open PowerShell in the project root and copy the example env file:

```powershell
Copy-Item .env.example .env.local
Copy-Item .env.example .env
```

Why both files:

- Next.js uses `.env.local`
- Prisma CLI loads `.env` automatically

For Windows local development, keep the database values in both files aligned.

Use this baseline in `.env.local`:

```env
# App-managed auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

# Local PostgreSQL
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myalphapulse
DB_QUERY=schema=public

# Local Mailpit
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false

# App auth cookie signing
APP_AUTH_SECRET=replace-this-with-a-strong-random-secret

DEFAULT_COMPANY_SLUG=default-company
```

Copy these same DB-related values into `.env`:

```env
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myalphapulse
DB_QUERY=schema=public
APP_AUTH_SECRET=replace-this-with-a-strong-random-secret
```

Notes:

- `APP_AUTH_SECRET` is required because auth is app-managed
- `DEFAULT_COMPANY_SLUG` selects the public company for this deployment
- that company must have a valid `publicTherapistId`
- local sign-up creates `Patient`, not `Therapist`
- default local seed users now live in [prisma/seeds/config/default-users.ts](/Users/davidguillen/Projects/david/alphabiohack/prisma/seeds/config/default-users.ts)
- the default local company profile lives in [prisma/seeds/config/default-company.ts](/Users/davidguillen/Projects/david/alphabiohack/prisma/seeds/config/default-company.ts)

## 2. Start Docker Services

Start PostgreSQL and Mailpit:

```powershell
docker compose up db mailpit
```

Available ports:

- PostgreSQL: `localhost:5432`
- Mailpit SMTP: `localhost:1025`
- Mailpit UI: `http://localhost:8025`

## 3. Install Dependencies

```powershell
npm install
```

## 4. Prepare The Database

Generate Prisma client:

```powershell
npx prisma generate
```

Apply migrations:

```powershell
npx prisma migrate deploy
```

Seed local data:

```powershell
npm run db:seed
```

Open Prisma Studio:

```powershell
npx prisma studio
```

## 5. Run The App

```powershell
npm run dev
```

The app will run at:

- `http://localhost:9001`

## Daily Workflow

Start services:

```powershell
docker compose up db mailpit
```

Run the app:

```powershell
npm run dev
```

Then:

- edit code
- save files
- let Next.js hot reload

You do not need `docker compose up --build` for normal code changes in this workflow.

## Common Windows Commands

Install dependencies:

```powershell
npm install
```

Generate Prisma client:

```powershell
npx prisma generate
```

Apply migrations:

```powershell
npx prisma migrate deploy
```

Check migration status:

```powershell
npx prisma migrate status
```

Create a new migration:

```powershell
npx prisma migrate dev --name your_migration_name
```

Seed data:

```powershell
npm run db:seed
```

Open Prisma Studio:

```powershell
npx prisma studio
```

Reset the database:

```powershell
npx prisma migrate reset --force
npm run db:seed
```

## Mailpit On Windows

To test local email:

- keep `EMAIL_PROVIDER=smtp`
- keep `SMTP_HOST=localhost`
- keep `SMTP_PORT=1025`

Open the inbox at:

- `http://localhost:8025`

## Full Docker Option

If you want to run the app container too:

```powershell
docker compose up --build
```

Use this only when you specifically want the full stack containerized.

For normal development on Windows, host-run app + Docker services is the better option.

## Troubleshooting

### Prisma says DB connection vars are missing

Make sure `DB_USER`, `DB_HOST`, and `DB_NAME` exist in `.env`, not only `.env.local`.

### Booking says therapist not found

Check:

- `DEFAULT_COMPANY_SLUG`
- that the referenced user has role `Therapist`

### Email is not arriving in Mailpit

Check:

- `EMAIL_PROVIDER=smtp`
- `SMTP_HOST=localhost`
- `SMTP_PORT=1025`
- Mailpit is running in Docker

### Docker works but app commands fail

Use PowerShell commands from this document instead of the Unix-style `npm run db:*` wrappers that rely on `sh`.

## Related Docs

- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
- [USER_IDENTITY_MODEL.md](./USER_IDENTITY_MODEL.md)
- [TIMEZONE_HANDLING.md](./TIMEZONE_HANDLING.md)
