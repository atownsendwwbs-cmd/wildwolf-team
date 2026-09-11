-- CreateEnum
CREATE TYPE "AlertResolution" AS ENUM ('RESTOCKED', 'DISCONTINUED');

-- AlterTable: InventoryAlert gets an optional resolution reason
ALTER TABLE "InventoryAlert" ADD COLUMN "resolution" "AlertResolution";
