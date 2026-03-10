-- CreateIndex
CREATE INDEX "bookings_therapistId_bookingSchedule_idx" ON "public"."bookings"("therapistId", "bookingSchedule");

-- CreateIndex
CREATE INDEX "bookings_patientId_bookingSchedule_idx" ON "public"."bookings"("patientId", "bookingSchedule");

-- CreateIndex
CREATE INDEX "bookings_status_bookingSchedule_idx" ON "public"."bookings"("status", "bookingSchedule");
