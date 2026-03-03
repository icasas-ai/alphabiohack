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

-- CreateIndex
CREATE INDEX "date_overrides_locationId_startDate_endDate_idx" ON "public"."date_overrides"("locationId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "override_time_slots_dateOverrideId_startTime_endTime_key" ON "public"."override_time_slots"("dateOverrideId", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "public"."date_overrides" ADD CONSTRAINT "date_overrides_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."override_time_slots" ADD CONSTRAINT "override_time_slots_dateOverrideId_fkey" FOREIGN KEY ("dateOverrideId") REFERENCES "public"."date_overrides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
