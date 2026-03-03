CREATE TABLE "public"."availability_excluded_dates" (
    "id" TEXT NOT NULL,
    "availabilityPeriodId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sessionDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_excluded_dates_pkey" PRIMARY KEY ("id")
);

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

CREATE UNIQUE INDEX "availability_excluded_dates_availabilityPeriodId_date_key"
ON "public"."availability_excluded_dates"("availabilityPeriodId", "date");

CREATE INDEX "availability_excluded_dates_locationId_date_idx"
ON "public"."availability_excluded_dates"("locationId", "date");

CREATE INDEX "availability_excluded_dates_therapistId_date_idx"
ON "public"."availability_excluded_dates"("therapistId", "date");

CREATE UNIQUE INDEX "availability_excluded_time_ranges_availabilityExcludedDateId_startTi_key"
ON "public"."availability_excluded_time_ranges"("availabilityExcludedDateId", "startTime", "endTime");

ALTER TABLE "public"."availability_excluded_dates"
ADD CONSTRAINT "availability_excluded_dates_availabilityPeriodId_fkey"
FOREIGN KEY ("availabilityPeriodId") REFERENCES "public"."availability_periods"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_excluded_dates"
ADD CONSTRAINT "availability_excluded_dates_therapistId_fkey"
FOREIGN KEY ("therapistId") REFERENCES "public"."users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_excluded_dates"
ADD CONSTRAINT "availability_excluded_dates_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."availability_excluded_time_ranges"
ADD CONSTRAINT "availability_excluded_time_ranges_availabilityExcludedDateId_fkey"
FOREIGN KEY ("availabilityExcludedDateId") REFERENCES "public"."availability_excluded_dates"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
