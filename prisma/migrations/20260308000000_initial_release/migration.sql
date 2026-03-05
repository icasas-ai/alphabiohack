-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."BookingType" AS ENUM ('DirectVisit', 'VideoCall', 'PhoneCall', 'HomeVisit');

-- CreateEnum
CREATE TYPE "public"."DaysOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('Therapist', 'Admin', 'FrontDesk', 'Patient');

-- CreateEnum
CREATE TYPE "public"."CompanyMembershipRole" AS ENUM ('Owner', 'Therapist', 'FrontDesk', 'Patient');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "managedByTherapistId" TEXT,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "avatar" TEXT,
    "telefono" TEXT,
    "informacionPublica" TEXT,
    "especialidad" TEXT,
    "summary" TEXT,
    "passwordHash" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
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
    "role" "public"."UserRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "headerLogo" TEXT,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_memberships" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."CompanyMembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "logo" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability_periods" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability_days" (
    "id" TEXT NOT NULL,
    "availabilityPeriodId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sessionDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability_excluded_dates" (
    "id" TEXT NOT NULL,
    "availabilityPeriodId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sessionDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_excluded_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability_excluded_time_ranges" (
    "id" TEXT NOT NULL,
    "availabilityExcludedDateId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_excluded_time_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability_time_ranges" (
    "id" TEXT NOT NULL,
    "availabilityDayId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_time_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_hours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "public"."DaysOfWeek" NOT NULL,
    "locationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."time_slots" (
    "id" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessHoursId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."date_overrides" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "date_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."override_time_slots" (
    "id" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dateOverrideId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "override_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."specialties" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bookingType" "public"."BookingType" NOT NULL,
    "locationId" TEXT NOT NULL,
    "specialtyId" TEXT,
    "serviceId" TEXT,
    "bookedDurationMinutes" INTEGER,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "givenConsent" BOOLEAN NOT NULL DEFAULT false,
    "therapistId" TEXT,
    "patientId" TEXT,
    "bookingNotes" TEXT,
    "bookingSchedule" TIMESTAMP(3) NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "public"."users"("supabaseId");

-- CreateIndex
CREATE INDEX "users_managedByTherapistId_idx" ON "public"."users"("managedByTherapistId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "public"."companies"("slug");

-- CreateIndex
CREATE INDEX "company_memberships_companyId_role_idx" ON "public"."company_memberships"("companyId", "role");

-- CreateIndex
CREATE INDEX "company_memberships_userId_role_idx" ON "public"."company_memberships"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "company_memberships_companyId_userId_key" ON "public"."company_memberships"("companyId", "userId");

-- CreateIndex
CREATE INDEX "locations_companyId_createdAt_idx" ON "public"."locations"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "availability_periods_companyId_therapistId_locationId_start_idx" ON "public"."availability_periods"("companyId", "therapistId", "locationId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "availability_days_companyId_date_idx" ON "public"."availability_days"("companyId", "date");

-- CreateIndex
CREATE INDEX "availability_days_locationId_date_idx" ON "public"."availability_days"("locationId", "date");

-- CreateIndex
CREATE INDEX "availability_days_therapistId_date_idx" ON "public"."availability_days"("therapistId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_days_therapistId_locationId_date_key" ON "public"."availability_days"("therapistId", "locationId", "date");

-- CreateIndex
CREATE INDEX "availability_excluded_dates_companyId_date_idx" ON "public"."availability_excluded_dates"("companyId", "date");

-- CreateIndex
CREATE INDEX "availability_excluded_dates_locationId_date_idx" ON "public"."availability_excluded_dates"("locationId", "date");

-- CreateIndex
CREATE INDEX "availability_excluded_dates_therapistId_date_idx" ON "public"."availability_excluded_dates"("therapistId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_excluded_dates_availabilityPeriodId_date_key" ON "public"."availability_excluded_dates"("availabilityPeriodId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_excluded_time_ranges_availabilityExcludedDateI_key" ON "public"."availability_excluded_time_ranges"("availabilityExcludedDateId", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "availability_time_ranges_availabilityDayId_startTime_endTim_key" ON "public"."availability_time_ranges"("availabilityDayId", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_locationId_dayOfWeek_key" ON "public"."business_hours"("locationId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_businessHoursId_startTime_endTime_key" ON "public"."time_slots"("businessHoursId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "date_overrides_locationId_startDate_endDate_idx" ON "public"."date_overrides"("locationId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "override_time_slots_dateOverrideId_startTime_endTime_key" ON "public"."override_time_slots"("dateOverrideId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "specialties_companyId_name_idx" ON "public"."specialties"("companyId", "name");

-- CreateIndex
CREATE INDEX "services_companyId_createdAt_idx" ON "public"."services"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_companyId_bookingSchedule_idx" ON "public"."bookings"("companyId", "bookingSchedule");

-- CreateIndex
CREATE INDEX "bookings_therapistId_bookingSchedule_idx" ON "public"."bookings"("therapistId", "bookingSchedule");

-- CreateIndex
CREATE INDEX "bookings_patientId_bookingSchedule_idx" ON "public"."bookings"("patientId", "bookingSchedule");

-- CreateIndex
CREATE INDEX "bookings_status_bookingSchedule_idx" ON "public"."bookings"("status", "bookingSchedule");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_managedByTherapistId_fkey" FOREIGN KEY ("managedByTherapistId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_publicTherapistId_fkey" FOREIGN KEY ("publicTherapistId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_memberships" ADD CONSTRAINT "company_memberships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_memberships" ADD CONSTRAINT "company_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_periods" ADD CONSTRAINT "availability_periods_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_periods" ADD CONSTRAINT "availability_periods_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_periods" ADD CONSTRAINT "availability_periods_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_days" ADD CONSTRAINT "availability_days_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_days" ADD CONSTRAINT "availability_days_availabilityPeriodId_fkey" FOREIGN KEY ("availabilityPeriodId") REFERENCES "public"."availability_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_days" ADD CONSTRAINT "availability_days_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_days" ADD CONSTRAINT "availability_days_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_excluded_dates" ADD CONSTRAINT "availability_excluded_dates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_excluded_dates" ADD CONSTRAINT "availability_excluded_dates_availabilityPeriodId_fkey" FOREIGN KEY ("availabilityPeriodId") REFERENCES "public"."availability_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_excluded_dates" ADD CONSTRAINT "availability_excluded_dates_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_excluded_dates" ADD CONSTRAINT "availability_excluded_dates_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_excluded_time_ranges" ADD CONSTRAINT "availability_excluded_time_ranges_availabilityExcludedDate_fkey" FOREIGN KEY ("availabilityExcludedDateId") REFERENCES "public"."availability_excluded_dates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_time_ranges" ADD CONSTRAINT "availability_time_ranges_availabilityDayId_fkey" FOREIGN KEY ("availabilityDayId") REFERENCES "public"."availability_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_hours" ADD CONSTRAINT "business_hours_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."time_slots" ADD CONSTRAINT "time_slots_businessHoursId_fkey" FOREIGN KEY ("businessHoursId") REFERENCES "public"."business_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."date_overrides" ADD CONSTRAINT "date_overrides_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."override_time_slots" ADD CONSTRAINT "override_time_slots_dateOverrideId_fkey" FOREIGN KEY ("dateOverrideId") REFERENCES "public"."date_overrides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."specialties" ADD CONSTRAINT "specialties_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "public"."specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "public"."specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
