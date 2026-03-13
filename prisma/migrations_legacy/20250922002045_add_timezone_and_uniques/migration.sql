/*
  Warnings:

  - A unique constraint covering the columns `[locationId,dayOfWeek]` on the table `business_hours` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessHoursId,startTime,endTime]` on the table `time_slots` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."locations" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles';

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_locationId_dayOfWeek_key" ON "public"."business_hours"("locationId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_businessHoursId_startTime_endTime_key" ON "public"."time_slots"("businessHoursId", "startTime", "endTime");
