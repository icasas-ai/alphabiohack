-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "specialtyId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "public"."specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
