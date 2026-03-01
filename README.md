# AlphaBioHack - Healthcare Booking Platform

A modern, full-stack healthcare appointment booking platform built with Next.js 15, enabling patients to book appointments with therapists and medical specialists.

For local setup with Dockerized PostgreSQL and local auth, see [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).
For the current user/therapist identity model and how public vs authenticated views resolve the active therapist, see [docs/USER_IDENTITY_MODEL.md](docs/USER_IDENTITY_MODEL.md).

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

## 🏥 Project Overview

AlphaBioHack is a healthcare booking platform that connects patients with therapists and medical specialists. The platform supports multiple appointment types, location management, service catalogs, and a comprehensive availability system with business hours and date overrides.

### User Roles

- **Patients**: Browse services, book appointments, manage bookings
- **Therapists**: Manage availability, view and manage appointments, configure services
- **Admin**: Full system administration

## ✨ Features

### Booking System
- Multiple booking types: Direct visits, Video calls, Phone calls, Home visits
- Service selection with duration and cost tracking
- Booking status workflow: Pending → Confirmed → In Progress → Completed
- Email notifications for appointment confirmations

### Availability Management
- Location-based availability configuration
- Weekly business hours with customizable time slots
- Date overrides for holidays and special closures
- Timezone support per location

### Multi-Location Support
- Multiple practice locations with addresses and coordinates
- Per-location business hours and availability
- Location-specific services

### Internationalization (i18n)
- English (en-US) and Spanish (es-MX) support
- Fully translated UI and API responses

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma |
| **Authentication** | Supabase Auth |
| **Email** | Resend |
| **State Management** | React Context, React Hook Form |
| **Testing** | Vitest, Playwright |
| **Component Docs** | Storybook |
| **Deployment** | Netlify |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)
- **PostgreSQL** database (or a [Supabase](https://supabase.com) account)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone git@github.com:icasas-ai/alphabiohack.git
cd alphabiohack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials (see [Environment Variables](#environment-variables)).

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data
npm run db:seed
```

### Docker option: local PostgreSQL

If you want to run the app with PostgreSQL in Docker, this repository now includes a `docker-compose.yml` with:

- `db`: PostgreSQL 16
- `app`: Next.js app with Prisma

1. Copy the env file:

```bash
cp .env.example .env.local
```

2. Fill in at least these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
RESEND_API_KEY=re_your_api_key

SINGLE_THERAPIST=true
SINGLE_THERAPIST_EMAIL=therapist@example.com
SINGLE_THERAPIST_SUPABASE_ID=your-supabase-user-id
SINGLE_THERAPIST_FIRSTNAME=John
SINGLE_THERAPIST_LASTNAME=Doe
SINGLE_THERAPIST_AVATAR=https://example.com/avatar.jpg
```

`DATABASE_URL` and `DIRECT_URL` are injected by Docker Compose for the local `db` container.

3. Start the stack:

```bash
docker compose up --build
```

4. In another terminal, seed the database:

```bash
docker compose exec app npm run db:seed
```

The app will be available at [http://localhost:3000](http://localhost:3000).

Important: this project still depends on Supabase Auth and parts of Supabase Storage. Running PostgreSQL in Docker replaces the database only; it does not replace Supabase Auth. If you want everything local, use the Supabase CLI local stack instead of plain PostgreSQL.

### Local auth without Supabase

The project also supports a local authentication mode when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` are left empty.

In that mode:

- authentication uses the local PostgreSQL database
- sessions are stored in an HTTP-only cookie
- new users can sign up and log in without Supabase

Optional:

```env
LOCAL_AUTH_SECRET=change-this-in-shared-environments
```

Notes:

- password reset and email confirmation remain Supabase-only flows
- existing seeded users do not have local passwords unless you add them manually

### 5. Start the development server

```bash
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000).

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key

# Database Connection (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key

# Default Therapist Configuration (for single-therapist mode)
SINGLE_THERAPIST=true
SINGLE_THERAPIST_EMAIL=therapist@example.com
SINGLE_THERAPIST_SUPABASE_ID=your-supabase-user-id
SINGLE_THERAPIST_FIRSTNAME=John
SINGLE_THERAPIST_LASTNAME=Doe
SINGLE_THERAPIST_AVATAR=https://example.com/avatar.jpg
NEXT_PUBLIC_DEFAULT_THERAPIST_ID=your-prisma-therapist-user-id
```

Important:

- local sign-up creates `Patient` users
- public booking uses `NEXT_PUBLIC_DEFAULT_THERAPIST_ID`
- that value must be the Prisma `users.id` of a user whose `role` includes `Therapist`

### Getting Credentials

- **Supabase**: Create a project at [supabase.com](https://supabase.com) and find credentials in Project Settings → API
- **Resend**: Sign up at [resend.com](https://resend.com) and create an API key

## 🗄 Database Setup

### Using Prisma Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### Database Schema Overview

The main entities in the database are:

- **User**: Patients, therapists, and admins
- **Location**: Practice locations with addresses and timezone
- **BusinessHours**: Weekly availability per location
- **TimeSlot**: Time slots within business hours
- **DateOverride**: Special date overrides (holidays, closures)
- **Specialty**: Medical specialties offered
- **Service**: Services with duration and cost
- **Booking**: Patient appointments

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for table descriptions and an ER diagram.

## 📁 Project Structure

```
alphabiohack/
├── app/
│   ├── [locale]/           # Internationalized pages
│   │   ├── (protected)/    # Authenticated routes
│   │   ├── (public)/       # Public routes
│   │   ├── auth/           # Authentication pages
│   │   └── booking/        # Booking flow pages
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── booking/            # Booking-related components
│   ├── availability/       # Availability management
│   ├── dashboard/          # Dashboard components
│   └── ...
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seeds/              # Seed data
├── services/               # Business logic services
├── types/                  # TypeScript type definitions
├── messages/               # i18n translation files
├── docs/                   # Additional documentation
└── stories/                # Storybook stories
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run storybook` | Start Storybook dev server |
| `npm run build-storybook` | Build Storybook |
| `npm run db:seed` | Seed the database |
| `npm run db:reset` | Reset and reseed database |

## 🔌 API Endpoints

The API follows RESTful conventions. Main endpoint groups:

| Endpoint | Description |
|----------|-------------|
| `/api/user` | Current user operations |
| `/api/users` | User management |
| `/api/therapists` | Therapist profiles and bookings |
| `/api/locations` | Location CRUD operations |
| `/api/business-hours` | Business hours management |
| `/api/overrides` | Date override management |
| `/api/specialties` | Medical specialties |
| `/api/services` | Services catalog |
| `/api/bookings` | Booking operations |
| `/api/dashboard` | Dashboard statistics |
| `/api/contact` | Contact form |

See [docs/API_ENDPOINTS_README.md](docs/API_ENDPOINTS_README.md) for detailed API documentation.

## 🚢 Deployment

### Netlify

The project is configured for Netlify deployment. Push to your connected branch to trigger a deploy.

```toml
# netlify.toml
[build]
  command = "npm run build"

[build.environment]
  TZ = "America/Los_Angeles"
```

### Environment Variables for Production

Ensure all environment variables from `.env.example` are configured in your deployment platform.

## 📚 Additional Documentation

- [API Endpoints](docs/API_ENDPOINTS_README.md)
- [Availability System](docs/AVAILABILITY_SYSTEM.md)
- [Supabase Storage Setup](docs/SUPABASE_STORAGE_SETUP.md)
- [Dropzone Component](docs/DROPZONE_README.md)

## 🧑‍💻 Development Guide

### Architecture Overview

The project follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                        │
│              (components/, app/[locale]/)               │
├─────────────────────────────────────────────────────────┤
│                   React Contexts                        │
│    (contexts/) - Global state: user, booking wizard     │
├─────────────────────────────────────────────────────────┤
│                   Custom Hooks                          │
│  (hooks/) - Data fetching, form logic, API calls        │
├─────────────────────────────────────────────────────────┤
│                   API Routes                            │
│          (app/api/) - REST endpoints                    │
├─────────────────────────────────────────────────────────┤
│                    Services                             │
│    (services/) - Business logic, Prisma queries         │
├─────────────────────────────────────────────────────────┤
│                    Database                             │
│         (prisma/) - PostgreSQL via Prisma               │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Pattern

1. **Contexts** (`contexts/`) - Provide global state (user session, booking wizard state)
2. **Hooks** (`hooks/`) - Handle data fetching and local state, call API endpoints
3. **API Routes** (`app/api/`) - Handle HTTP requests, validate input, call services
4. **Services** (`services/`) - Contain business logic, interact with Prisma/database

**Example flow for fetching locations:**

```
useLocations hook → fetch('/api/locations') → locationService.getAllLocations() → Prisma → DB
```

### Common Development Tasks

#### Adding a New API Endpoint

1. **Create the service function** in `services/`:

```typescript
// services/example.service.ts
import { prisma } from "@/lib/prisma";

export const getExampleById = async (id: string) => {
  return prisma.example.findUnique({ where: { id } });
};
```

2. **Export from services index**:

```typescript
// services/index.ts
export * from "./example.service";
```

3. **Create the API route** in `app/api/`:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getExampleById } from "@/services";
import { errorResponse, successResponse } from "@/services/api-errors.service";

export async function GET(request: NextRequest) {
  try {
    const data = await getExampleById("...");
    return NextResponse.json(successResponse(data));
  } catch (error) {
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}
```

4. **Add endpoint constant** in `constants/index.ts`:

```typescript
EXAMPLE: {
  BASE: "/api/example",
  BY_ID: (id: string) => `/api/example/${id}`,
},
```

5. **Create a hook** in `hooks/`:

```typescript
// hooks/use-example.ts
import { API_ENDPOINTS } from "@/constants";

export function useExample() {
  const fetchExample = async (id: string) => {
    const response = await fetch(API_ENDPOINTS.EXAMPLE.BY_ID(id));
    return response.json();
  };
  return { fetchExample };
}
```

#### Adding a New Page

1. Create the page in `app/[locale]/(public)/` or `app/[locale]/(protected)/`:

```typescript
// app/[locale]/(public)/example/page.tsx
export default function ExamplePage() {
  return <div>Example Page</div>;
}
```

- `(public)` - Accessible without authentication
- `(protected)` - Requires authentication

#### Adding Translations (i18n)

1. Add keys to both translation files:

```json
// messages/en-US.json
{
  "ExamplePage": {
    "title": "Example Title",
    "description": "Example description"
  }
}
```

```json
// messages/es-MX.json
{
  "ExamplePage": {
    "title": "Título de Ejemplo",
    "description": "Descripción de ejemplo"
  }
}
```

2. Use translations in components:

```typescript
import { useTranslations } from "next-intl";

export function ExampleComponent() {
  const t = useTranslations("ExamplePage");
  return <h1>{t("title")}</h1>;
}
```

#### Creating Components with Storybook

1. Create your component in `components/`:

```typescript
// components/example/example-card.tsx
interface ExampleCardProps {
  title: string;
  description?: string;
}

export function ExampleCard({ title, description }: ExampleCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
```

2. Create a story in `stories/`:

```typescript
// stories/ExampleCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ExampleCard } from "../components/example/example-card";

const meta: Meta<typeof ExampleCard> = {
  title: "Components/ExampleCard",
  component: ExampleCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Example Title",
    description: "Example description",
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "Title Only",
  },
};
```

3. Run Storybook: `npm run storybook`

### Testing

#### Running Tests

```bash
# Run all tests
npx vitest

# Run tests in watch mode
npx vitest --watch

# Run tests with coverage
npx vitest --coverage

# Run Storybook tests (component tests)
npm run storybook
# Then in another terminal:
npx vitest --project=storybook
```

#### Test Configuration

- **Vitest** is configured in `vitest.config.ts`
- **Storybook integration** - Component stories are automatically tested
- **Playwright** is available for E2E tests

### Code Conventions

#### File Naming
- Components: `kebab-case.tsx` (e.g., `example-card.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-example.ts`)
- Services: `kebab-case.service.ts` (e.g., `example.service.ts`)
- Types: `kebab-case.ts` (e.g., `example.ts`)

#### Component Structure
```typescript
"use client"; // Only if using client-side features

import { useState } from "react"; // React imports first
import { useTranslations } from "next-intl"; // Third-party imports
import { Button } from "@/components/ui/button"; // Internal imports
import type { ExampleType } from "@/types"; // Type imports last

interface Props {
  // Props interface
}

export function ComponentName({ prop }: Props) {
  // Component implementation
}
```

#### API Response Format
```typescript
// Success response
{ success: true, data: {...}, message?: "success_key" }

// Error response
{ success: false, errorCode: "error_key", message: "..." }
```

### Troubleshooting

#### Common Issues

**1. Prisma Client not generated**
```bash
npx prisma generate
```

**2. Database connection issues**
- Verify `DATABASE_URL` and `DIRECT_URL` in `.env.local`
- Ensure Supabase project is running

**3. Authentication not working**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- Verify Supabase Auth settings in dashboard

**4. Migrations out of sync**
```bash
npx prisma migrate dev
```

**5. TypeScript errors after schema changes**
```bash
npx prisma generate
# Restart your IDE/editor
```

**6. Storybook not loading components**
```bash
# Clear Storybook cache
rm -rf node_modules/.cache/storybook
npm run storybook
```

### Useful Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run storybook              # Start Storybook

# Database
npx prisma studio              # Open Prisma Studio (DB GUI)
npx prisma migrate dev         # Create and apply migrations
npx prisma db push             # Push schema without migration
npm run db:seed                # Seed database
npm run db:reset               # Reset and reseed

# Code Quality
npm run lint                   # Run ESLint
npx tsc --noEmit               # Type check without building

# Build
npm run build                  # Production build
npm run start                  # Start production server
```

## 🤝 Contributing

1. Create a feature branch from `master`
2. Make your changes following the code conventions above
3. Add/update translations if adding user-facing text
4. Write or update tests for your changes
5. Run linting: `npm run lint`
6. Submit a pull request

## 📄 License

This project is private and proprietary.
