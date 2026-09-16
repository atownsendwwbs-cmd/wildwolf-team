-- AlterTable: returnDate becomes required -- backfill any existing rows
-- (without a return date on file) to their reported date before that.
UPDATE "TimeOffRequest" SET "returnDate" = "date" WHERE "returnDate" IS NULL;

ALTER TABLE "TimeOffRequest" ALTER COLUMN "returnDate" SET NOT NULL;
