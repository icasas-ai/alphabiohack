ALTER TABLE "public"."users"
DROP COLUMN IF EXISTS "weekdaysHours",
DROP COLUMN IF EXISTS "saturdayHours",
DROP COLUMN IF EXISTS "sundayHours";
