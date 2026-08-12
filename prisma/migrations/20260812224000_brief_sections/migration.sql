-- AlterTable: add the new structured section columns (nullable at first
-- so existing rows aren't rejected)
ALTER TABLE "DailyBrief" ADD COLUMN "introEn" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "introEs" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "productionEn" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "productionEs" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "packingEn" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "packingEs" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "specialEn" TEXT;
ALTER TABLE "DailyBrief" ADD COLUMN "specialEs" TEXT;

-- Backfill existing briefs: fold the old single content blob into the new
-- "Intro" section (closest fit for a general day-overview post) so nothing
-- posted before this change is lost. The new Production/Packing/Special
-- sections start empty — there's nothing to backfill them from.
UPDATE "DailyBrief"
SET "introEn" = "contentEn",
    "introEs" = "contentEs",
    "productionEn" = '{"tiktok":"","amazon":"","faire":"","whatnot":"","other":""}',
    "productionEs" = '{"tiktok":"","amazon":"","faire":"","whatnot":"","other":""}',
    "packingEn" = '',
    "packingEs" = '',
    "specialEn" = '',
    "specialEs" = ''
WHERE "introEn" IS NULL;

-- AlterTable: now that every row is backfilled, enforce NOT NULL
ALTER TABLE "DailyBrief" ALTER COLUMN "introEn" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "introEs" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "productionEn" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "productionEs" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "packingEn" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "packingEs" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "specialEn" SET NOT NULL;
ALTER TABLE "DailyBrief" ALTER COLUMN "specialEs" SET NOT NULL;

-- AlterTable: drop the old single-blob columns
ALTER TABLE "DailyBrief" DROP COLUMN "contentEn";
ALTER TABLE "DailyBrief" DROP COLUMN "contentEs";
