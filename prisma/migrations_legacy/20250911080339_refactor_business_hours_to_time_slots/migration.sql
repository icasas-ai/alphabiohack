/*
  Warnings:

  - You are about to drop the column `endTime` on the `business_hours` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `business_hours` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."business_hours" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

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

-- AddForeignKey
ALTER TABLE "public"."time_slots" ADD CONSTRAINT "time_slots_businessHoursId_fkey" FOREIGN KEY ("businessHoursId") REFERENCES "public"."business_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
