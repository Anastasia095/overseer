-- CreateEnum
CREATE TYPE "VehicleOwnership" AS ENUM ('OWNER_OPERATOR', 'LEASED');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "ownerDriverId" INTEGER,
ADD COLUMN     "ownership" "VehicleOwnership" NOT NULL DEFAULT 'LEASED';

-- CreateTable
CREATE TABLE "DriverVehicle" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicle_driverId_vehicleId_key" ON "DriverVehicle"("driverId", "vehicleId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerDriverId_fkey" FOREIGN KEY ("ownerDriverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicle" ADD CONSTRAINT "DriverVehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicle" ADD CONSTRAINT "DriverVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
