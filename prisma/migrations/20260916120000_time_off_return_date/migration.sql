-- AlterTable: add optional return date, make timeNote required
ALTER TABLE "TimeOffRequest" ADD COLUMN "returnDate" TIMESTAMP(3);

UPDATE "TimeOffRequest" SET "timeNote" = 'Not specified' WHERE "timeNote" IS NULL;

ALTER TABLE "TimeOffRequest" ALTER COLUMN "timeNote" SET NOT NULL;
