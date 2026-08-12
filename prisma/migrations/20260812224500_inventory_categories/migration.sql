-- CreateEnum
CREATE TYPE "StockLevel" AS ENUM ('UNDER_100', 'UNDER_50', 'UNDER_25', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "RawMaterialStatus" AS ENUM ('OUT', 'LOW');

-- CreateEnum
CREATE TYPE "BoxSize" AS ENUM ('SIZE_8X6X6', 'SIZE_12X12X12', 'SIZE_14X9X9', 'SIZE_14X12X10', 'SIZE_15X15X15', 'SIZE_16X12X12', 'SIZE_24X16X16', 'SIZE_36X12X16', 'SIZE_24X20X20', 'SIZE_24X16X12');

-- AlterTable
ALTER TABLE "InventoryAlert" ADD COLUMN     "boxSize" "BoxSize",
ADD COLUMN     "quantity" TEXT,
ADD COLUMN     "rawMaterialStatus" "RawMaterialStatus",
ADD COLUMN     "stockLevel" "StockLevel",
ADD COLUMN     "supplySize" TEXT,
ALTER COLUMN "urgency" DROP NOT NULL,
ALTER COLUMN "urgency" DROP DEFAULT;
