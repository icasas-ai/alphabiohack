CREATE TABLE "public"."availability_periods" (
    "id" TEXT NOT NULL,
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

CREATE TABLE "public"."availability_days" (
    "id" TEXT NOT NULL,
    "availabilityPeriodId" TEXT NOT NULL,
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

CREATE INDEX "availability_periods_therapistId_locationId_startDate_endDate_idx"
ON "public"."availability_periods"("therapistId", "locationId", "startDate", "endDate");

CREATE UNIQUE INDEX "availability_days_therapistId_locationId_date_key"
ON "public"."availability_days"("therapistId", "locationId", "date");

CREATE INDEX "availability_days_locationId_date_idx"
ON "public"."availability_days"("locationId", "date");

CREATE INDEX "availability_days_therapistId_date_idx"
ON "public"."availability_days"("therapistId", "date");

CREATE UNIQUE INDEX "availability_time_ranges_availabilityDayId_startTime_endTime_key"
ON "public"."availability_time_ranges"("availabilityDayId", "startTime", "endTime");

ALTER TABLE "public"."availability_periods"
ADD CONSTRAINT "availability_periods_therapistId_fkey"
FOREIGN KEY ("therapistId") REFERENCES "public"."users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_periods"
ADD CONSTRAINT "availability_periods_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_days"
ADD CONSTRAINT "availability_days_availabilityPeriodId_fkey"
FOREIGN KEY ("availabilityPeriodId") REFERENCES "public"."availability_periods"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_days"
ADD CONSTRAINT "availability_days_therapistId_fkey"
FOREIGN KEY ("therapistId") REFERENCES "public"."users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_days"
ADD CONSTRAINT "availability_days_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_time_ranges"
ADD CONSTRAINT "availability_time_ranges_availabilityDayId_fkey"
FOREIGN KEY ("availabilityDayId") REFERENCES "public"."availability_days"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
