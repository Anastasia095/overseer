/*
  Warnings:

  - You are about to drop the column `lastLocationAddress` on the `DriverProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DriverProfile" DROP COLUMN "lastLocationAddress",
ADD COLUMN     "lastLocationLabel" TEXT;
