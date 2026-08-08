-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "lastGeocodedLat" DOUBLE PRECISION,
ADD COLUMN     "lastGeocodedLng" DOUBLE PRECISION,
ADD COLUMN     "lastLocationAddress" TEXT;
