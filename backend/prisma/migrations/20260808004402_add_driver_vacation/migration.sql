-- CreateTable
CREATE TABLE "DriverVacation" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverVacation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DriverVacation" ADD CONSTRAINT "DriverVacation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
