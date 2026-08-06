import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate, requirePermission } from "../middleware/auth.js";

const router = Router();

const VALID_STATUSES = ["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"];

router.get(
  "/",
  authenticate,
  requirePermission("vehicles.view"),
  asyncHandler(async (_req, res) => {
    const vehicles = await prisma.vehicle.findMany({
      where: { deletedAt: null },
      include: {
        ownerDriver: { select: { firstName: true, lastName: true } },
        driverVehicles: { select: { driverId: true } },
      },
      orderBy: { id: "asc" },
    });

    res.json(
      vehicles.map((v) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
        vin: v.vin,
        plate: v.plate,
        status: v.status,
        ownership: v.ownership,
        ownerDriverId: v.ownerDriverId,
        ownerName: v.ownerDriver
          ? `${v.ownerDriver.firstName} ${v.ownerDriver.lastName}`
          : null,
        driverIds: v.driverVehicles.map((dv) => dv.driverId),
      })),
    );
  }),
);

router.post(
  "/",
  authenticate,
  requirePermission("vehicles.create"),
  asyncHandler(async (req, res) => {
    const { make, model, year, vin, plate, status, ownership, ownerDriverId } =
      req.body ?? {};

    if (!make || !model || !year || !vin || !plate) {
      res.status(400).json({ error: "make, model, year, vin and plate are required" });
      return;
    }

    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      res.status(400).json({ error: "year must be a valid year" });
      return;
    }

    const vehicleStatus = VALID_STATUSES.includes(status) ? status : "AVAILABLE";
    const ownershipType = ownership === "OWNER_OPERATOR" ? "OWNER_OPERATOR" : "LEASED";

    const data: {
      make: string;
      model: string;
      year: number;
      vin: string;
      plate: string;
      status: string;
      ownership: string;
      ownerDriverId?: number;
    } = {
      make: String(make),
      model: String(model),
      year: parsedYear,
      vin: String(vin),
      plate: String(plate),
      status: vehicleStatus,
      ownership: ownershipType,
    };

    if (ownershipType === "OWNER_OPERATOR") {
      if (!ownerDriverId) {
        res.status(400).json({ error: "ownerDriverId is required for owner-operator vehicles" });
        return;
      }
      const owner = await prisma.user.findFirst({
        where: {
          id: Number(ownerDriverId),
          deletedAt: null,
          roles: { some: { slug: "driver" } },
        },
      });
      if (!owner) {
        res.status(400).json({ error: "ownerDriverId must reference a driver" });
        return;
      }
      data.ownerDriverId = owner.id;
    }

    try {
      const vehicle = await prisma.vehicle.create({
        data: {
          ...data,
          status: data.status as "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE",
          ownership: data.ownership as "OWNER_OPERATOR" | "LEASED",
        },
      });
      res.status(201).json({ vehicle });
    } catch (err) {
      if ((err as { code?: string }).code === "P2002") {
        res.status(409).json({ error: "A vehicle with this VIN or plate already exists" });
        return;
      }
      throw err;
    }
  }),
);

export default router;
