-- AlterTable
ALTER TABLE "Bean" ADD COLUMN "altitude" TEXT;
ALTER TABLE "Bean" ADD COLUMN "process" TEXT;
ALTER TABLE "Bean" ADD COLUMN "roastLevel" TEXT;
ALTER TABLE "Bean" ADD COLUMN "tastingNotes" TEXT;

-- AlterTable
ALTER TABLE "BrewLog" ADD COLUMN "brewTimeSec" INTEGER;
ALTER TABLE "BrewLog" ADD COLUMN "doseG" REAL;
ALTER TABLE "BrewLog" ADD COLUMN "yieldG" REAL;
