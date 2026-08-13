-- AlterTable: per-user language preference, safe to add directly since it
-- has a default (existing users default to English)
ALTER TABLE "User" ADD COLUMN "preferredLang" "Lang" NOT NULL DEFAULT 'EN';

-- AlterTable: make Announcement bilingual, same pattern as DailyBrief —
-- add nullable columns, backfill, then enforce NOT NULL
ALTER TABLE "Announcement" ADD COLUMN "sourceLang" "Lang" NOT NULL DEFAULT 'EN';
ALTER TABLE "Announcement" ADD COLUMN "messageEn" TEXT;
ALTER TABLE "Announcement" ADD COLUMN "messageEs" TEXT;
ALTER TABLE "Announcement" ADD COLUMN "translated" BOOLEAN NOT NULL DEFAULT true;

-- Backfill existing announcements: treat them as English-sourced, and mark
-- them as not machine-translated (mirrors old text into Spanish) so the UI
-- shows a "translation unavailable" notice instead of presenting English
-- text as Spanish.
UPDATE "Announcement"
SET "messageEn" = "message",
    "messageEs" = "message",
    "translated" = false
WHERE "messageEn" IS NULL;

ALTER TABLE "Announcement" ALTER COLUMN "messageEn" SET NOT NULL;
ALTER TABLE "Announcement" ALTER COLUMN "messageEs" SET NOT NULL;

ALTER TABLE "Announcement" DROP COLUMN "message";
