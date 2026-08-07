-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('EN', 'ES');

-- AlterTable: add new bilingual columns (nullable at first so existing rows aren't rejected)
ALTER TABLE "DailyBrief" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "contentEn" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "titleEs" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "contentEs" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "sourceLang" "Lang" NOT NULL DEFAULT 'EN';
ALTER TABLE "DailyBrief" ADD COLUMN "translated" BOOLEAN NOT NULL DEFAULT true;

-- Backfill existing briefs: treat them as English-sourced, and mark them as
-- not machine-translated (the Spanish columns just mirror the English text
-- until someone re-posts) so the UI can show a "translation unavailable"
-- notice instead of silently presenting English text as Spanish.
UPDATE "DailyBrief"
SET "titleEn" = "title",
    "contentEn" = "content",
    "titleEs" = "title",
    "contentEs" = "content",
    "translated" = false
WHERE "titleEn" IS NULL;

-- AlterTable: now that every row is backfilled, enforce NOT NULL
ALTER TABLE "DailyBrief" ALTER COLUMN "titleEn" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "contentEn" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "titleEs" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "contentEs" SET NOT NULL;

-- AlterTable: drop the old single-language columns
ALTER TABLE "DailyBrief" DROP COLUMN "title";
ALTER TABLE "DailyBrief" DROP COLUMN "content";
