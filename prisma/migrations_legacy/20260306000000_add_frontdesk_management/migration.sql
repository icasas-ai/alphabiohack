ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "managedByTherapistId" TEXT,
ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_managedByTherapistId_fkey'
  ) THEN
    ALTER TABLE "users"
    ADD CONSTRAINT "users_managedByTherapistId_fkey"
    FOREIGN KEY ("managedByTherapistId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "users_managedByTherapistId_idx"
ON "users"("managedByTherapistId");
