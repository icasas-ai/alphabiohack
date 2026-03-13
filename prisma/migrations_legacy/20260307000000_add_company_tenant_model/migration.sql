DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'CompanyMembershipRole'
  ) THEN
    CREATE TYPE "CompanyMembershipRole" AS ENUM ('Owner', 'Therapist', 'FrontDesk', 'Patient');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "companies" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logo" TEXT,
  "publicEmail" TEXT,
  "publicPhone" TEXT,
  "publicDescription" TEXT,
  "publicSummary" TEXT,
  "publicSpecialty" TEXT,
  "defaultTimezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  "publicTherapistId" TEXT,
  "weekdaysHours" TEXT DEFAULT '9:00 AM - 6:00 PM',
  "saturdayHours" TEXT DEFAULT '9:00 AM - 2:00 PM',
  "sundayHours" TEXT DEFAULT 'Closed',
  "facebook" TEXT,
  "instagram" TEXT,
  "linkedin" TEXT,
  "twitter" TEXT,
  "tiktok" TEXT,
  "youtube" TEXT,
  "website" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "companies_slug_key" ON "companies"("slug");

CREATE TABLE IF NOT EXISTS "company_memberships" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "CompanyMembershipRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "company_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "company_memberships_companyId_userId_key"
ON "company_memberships"("companyId", "userId");

CREATE INDEX IF NOT EXISTS "company_memberships_companyId_role_idx"
ON "company_memberships"("companyId", "role");

CREATE INDEX IF NOT EXISTS "company_memberships_userId_role_idx"
ON "company_memberships"("userId", "role");

ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "availability_periods" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "availability_days" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "availability_excluded_dates" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

INSERT INTO "companies" (
  "id",
  "name",
  "slug",
  "publicEmail",
  "publicPhone",
  "publicDescription",
  "publicSummary",
  "publicSpecialty",
  "defaultTimezone",
  "weekdaysHours",
  "saturdayHours",
  "sundayHours",
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
  "tiktok",
  "youtube",
  "website",
  "publicTherapistId"
)
SELECT
  'default-company',
  COALESCE(
    NULLIF(TRIM(CONCAT(u."firstname", ' ', u."lastname")), ''),
    'Default Company'
  ),
  'default-company',
  u."email",
  u."telefono",
  u."informacionPublica",
  u."summary",
  u."especialidad",
  'America/Los_Angeles',
  u."weekdaysHours",
  u."saturdayHours",
  u."sundayHours",
  u."facebook",
  u."instagram",
  u."linkedin",
  u."twitter",
  u."tiktok",
  u."youtube",
  u."website",
  u."id"
FROM "users" u
WHERE 'Therapist' = ANY(u."role")
ORDER BY u."createdAt" ASC
LIMIT 1
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "companies" (
  "id",
  "name",
  "slug"
)
VALUES (
  'default-company',
  'Default Company',
  'default-company'
)
ON CONFLICT ("id") DO NOTHING;

UPDATE "locations"
SET "companyId" = 'default-company'
WHERE "companyId" IS NULL;

UPDATE "specialties"
SET "companyId" = 'default-company'
WHERE "companyId" IS NULL;

UPDATE "services" s
SET "companyId" = COALESCE(sp."companyId", 'default-company')
FROM "specialties" sp
WHERE s."specialtyId" = sp."id"
  AND s."companyId" IS NULL;

UPDATE "bookings"
SET "companyId" = 'default-company'
WHERE "companyId" IS NULL;

UPDATE "availability_periods"
SET "companyId" = 'default-company'
WHERE "companyId" IS NULL;

UPDATE "availability_days"
SET "companyId" = 'default-company'
WHERE "companyId" IS NULL;

UPDATE "availability_excluded_dates"
SET "companyId" = 'default-company'
WHERE "companyId" IS NULL;

INSERT INTO "company_memberships" ("id", "companyId", "userId", "role")
SELECT
  CONCAT('company-membership-', u."id"),
  'default-company',
  u."id",
  CASE
    WHEN 'Admin' = ANY(u."role") THEN 'Owner'::"CompanyMembershipRole"
    WHEN 'Therapist' = ANY(u."role") THEN 'Therapist'::"CompanyMembershipRole"
    WHEN 'FrontDesk' = ANY(u."role") THEN 'FrontDesk'::"CompanyMembershipRole"
    ELSE 'Patient'::"CompanyMembershipRole"
  END
FROM "users" u
ON CONFLICT ("companyId", "userId") DO NOTHING;

ALTER TABLE "locations" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "specialties" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "availability_periods" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "availability_days" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "availability_excluded_dates" ALTER COLUMN "companyId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_publicTherapistId_fkey'
  ) THEN
    ALTER TABLE "companies"
      ADD CONSTRAINT "companies_publicTherapistId_fkey"
      FOREIGN KEY ("publicTherapistId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'company_memberships_companyId_fkey'
  ) THEN
    ALTER TABLE "company_memberships"
      ADD CONSTRAINT "company_memberships_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'company_memberships_userId_fkey'
  ) THEN
    ALTER TABLE "company_memberships"
      ADD CONSTRAINT "company_memberships_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locations_companyId_fkey'
  ) THEN
    ALTER TABLE "locations"
      ADD CONSTRAINT "locations_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'specialties_companyId_fkey'
  ) THEN
    ALTER TABLE "specialties"
      ADD CONSTRAINT "specialties_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_companyId_fkey'
  ) THEN
    ALTER TABLE "services"
      ADD CONSTRAINT "services_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_companyId_fkey'
  ) THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'availability_periods_companyId_fkey'
  ) THEN
    ALTER TABLE "availability_periods"
      ADD CONSTRAINT "availability_periods_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'availability_days_companyId_fkey'
  ) THEN
    ALTER TABLE "availability_days"
      ADD CONSTRAINT "availability_days_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'availability_excluded_dates_companyId_fkey'
  ) THEN
    ALTER TABLE "availability_excluded_dates"
      ADD CONSTRAINT "availability_excluded_dates_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "locations_companyId_createdAt_idx"
ON "locations"("companyId", "createdAt");

CREATE INDEX IF NOT EXISTS "specialties_companyId_name_idx"
ON "specialties"("companyId", "name");

CREATE INDEX IF NOT EXISTS "services_companyId_createdAt_idx"
ON "services"("companyId", "createdAt");

CREATE INDEX IF NOT EXISTS "bookings_companyId_bookingSchedule_idx"
ON "bookings"("companyId", "bookingSchedule");

CREATE INDEX IF NOT EXISTS "availability_periods_companyId_therapistId_locationId_startDate_endDate_idx"
ON "availability_periods"("companyId", "therapistId", "locationId", "startDate", "endDate");

CREATE INDEX IF NOT EXISTS "availability_days_companyId_date_idx"
ON "availability_days"("companyId", "date");

CREATE INDEX IF NOT EXISTS "availability_excluded_dates_companyId_date_idx"
ON "availability_excluded_dates"("companyId", "date");
