ALTER TABLE "public"."bookings"
ADD COLUMN "bookingNumber" TEXT;

UPDATE "public"."bookings"
SET "bookingNumber" = 'BK-' || TO_CHAR(COALESCE("createdAt", NOW()), 'YYMMDD') || '-' || UPPER(SUBSTRING(REPLACE("id", '-', '') FROM 1 FOR 6))
WHERE "bookingNumber" IS NULL;

ALTER TABLE "public"."bookings"
ALTER COLUMN "bookingNumber" SET NOT NULL;

CREATE UNIQUE INDEX "bookings_bookingNumber_key"
ON "public"."bookings"("bookingNumber");
