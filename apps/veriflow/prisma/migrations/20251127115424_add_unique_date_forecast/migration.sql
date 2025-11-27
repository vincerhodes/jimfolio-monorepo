/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `capacity_forecasts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "capacity_forecasts_date_key" ON "capacity_forecasts"("date");
