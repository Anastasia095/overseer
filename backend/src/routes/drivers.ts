import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate, requirePermission } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { reverseGeocode } from "../services/geocode.js";

const router = Router();

//get all drivers
router.get(
  "/",
  //MIDDLEWARE: 
  authenticate,
  requirePermission("drivers.view"),

  // ERROR HANDLING Wrapper 
  asyncHandler(async (req: AuthRequest, res) => {

    // DATABASE QUERY
    const isDispatcherOnly =
      req.user?.roles.includes("dispatcher") &&
      !req.user?.roles.some((r) => r === "admin" || r === "hr");

    const users = await prisma.user.findMany({
      // Filter: Only get active users (not deleted) who have the "driver" role
      where: {
        roles: { some: { slug: "driver" } },
        deletedAt: null,
        // Dispatchers only see the drivers assigned to them; admin/HR see all
        ...(isDispatcherOnly ? { driverProfile: { assignedDispatcherId: req.user!.id } } : {}),
      },
      // Joins: Fetch related relational data at the same time
      include: {
        driverProfile: {
          include: {
            dispatcher: true, // fetch the dispatcher assigned to this driver
          },
        },
        driverVehicles: {
          select: { vehicleId: true } // Only grab the vehicle IDs, ignore other vehicle data
        },
      },
    });

    //Format for rendering
    const drivers = users
      // Safety check: Filter out any users that somehow lack a driver profile
      .filter((u) => u.driverProfile !== null)
      // flatten remaining users
      .map((u) => {
        const profile = u.driverProfile!;

        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          status: profile.status,

          dispatcherId: profile.assignedDispatcherId,
          dispatcher: profile.dispatcher
            ? `${profile.dispatcher.firstName} ${profile.dispatcher.lastName}`
            : null,

          // Flatten the array of vehicle objects into just an array of IDs
          vehicleIds: u.driverVehicles.map((dv) => dv.vehicleId),

          phone: u.phone,
          lastLat: profile.lastLat,
          lastLng: profile.lastLng,
          lastLocationAt: profile.lastLocationAt,
          lastLocationLabel: profile.lastLocationLabel,
        };
      });

    res.json(drivers);
  }),
);

//get specific driver
router.get(
  "/:id",
  authenticate,
  requirePermission("drivers.view"),

  asyncHandler(async (_req, res) => {
    const id = parseInt(_req.params.id, 10);

    const user = await prisma.user.findFirst({
      where: {
        id,
        roles: { some: { slug: "driver" } },
        deletedAt: null,
      },
      include: {
        driverProfile: {
          include: {
            dispatcher: true,
          },
        },
        driverVehicles: {
          include: {
            vehicle: {
              include: {
                ownerDriver: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        vacations: true,
      },
    });

    if (!user || !user.driverProfile) {
      res.status(404).json({ message: "Driver not found" });
      return;
    }

    const profile = user.driverProfile;

    const driver = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      status: profile.status,

      dispatcherId: profile.assignedDispatcherId,
      dispatcher: profile.dispatcher
        ? `${profile.dispatcher.firstName} ${profile.dispatcher.lastName}`
        : null,

      licenseNo: profile.licenseNo,
      licenseClass: profile.licenseClass,
      licenseExpiry: profile.licenseExpiry,

      vehicleIds: user.driverVehicles.map((dv) => dv.vehicle.id),
      vehicles: user.driverVehicles.map((dv) => ({
        id: dv.vehicle.id,
        make: dv.vehicle.make,
        model: dv.vehicle.model,
        year: dv.vehicle.year,
        vin: dv.vehicle.vin,
        plate: dv.vehicle.plate,
        status: dv.vehicle.status,
        ownership: dv.vehicle.ownership,
        ownerName: dv.vehicle.ownerDriver
          ? `${dv.vehicle.ownerDriver.firstName} ${dv.vehicle.ownerDriver.lastName}`
          : null,
      })),
      lastLat: profile.lastLat,
      lastLng: profile.lastLng,
      lastLocationAt: profile.lastLocationAt,
      lastLocationLabel: profile.lastLocationLabel,

      vacations: user.vacations
        .map((v) => ({
          id: v.id,
          startDate: v.startDate,
          endDate: v.endDate,
        }))
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),

      createdAt: user.createdAt,
    };

    res.json(driver);
  })
);

//resolve geocode
router.post(
  "/:id/geocode",
  authenticate,
  requirePermission("drivers.view"),

  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "Invalid driver id" });
      return;
    }

    const profile = await prisma.driverProfile.findUnique({ where: { driverId: id } });
    if (!profile || profile.deletedAt) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }

    if (profile.lastLat === null || profile.lastLng === null) {
      res.json({ address: null });
      return;
    }

    // Cache hit: already resolved, so skip api call
    if (
      profile.lastLocationLabel &&
      profile.lastGeocodedLat === profile.lastLat &&
      profile.lastGeocodedLng === profile.lastLng
    ) {
      res.json({ address: profile.lastLocationLabel });
      return;
    }

    const address = await reverseGeocode(profile.lastLat, profile.lastLng);
    if (address) {
      await prisma.driverProfile.update({
        where: { driverId: id },
        data: {
          lastLocationLabel: address,
          lastGeocodedLat: profile.lastLat,
          lastGeocodedLng: profile.lastLng,
        },
      });
      res.json({ address });
      return;
    }

    // No API key or the request failed 
    res.json({ address: null });
  })
);
//set dispatcher
router.put(
  "/:id/dispatcher",
  authenticate,
  requirePermission("drivers.update"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "Invalid driver id" });
      return;
    }

    const rawDispatcherId = req.body?.dispatcherId ?? null;
    const dispatcherId = rawDispatcherId === null ? null : Number(rawDispatcherId);
    if (dispatcherId !== null && !Number.isInteger(dispatcherId)) {
      res.status(400).json({ error: "dispatcherId must be an integer or null" });
      return;
    }

    if (dispatcherId !== null) {
      const dispatcher = await prisma.user.findFirst({
        where: {
          id: dispatcherId,
          deletedAt: null,
          roles: { some: { slug: "dispatcher" } },
        },
      });
      if (!dispatcher) {
        res.status(400).json({ error: "dispatcherId must reference a dispatcher" });
        return;
      }
    }

    const profile = await prisma.driverProfile.findUnique({ where: { driverId: id } });
    if (!profile || profile.deletedAt) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }

    const updated = await prisma.driverProfile.update({
      where: { driverId: id },
      data: { assignedDispatcherId: dispatcherId },
    });

    res.json({ driverId: id, dispatcherId: updated.assignedDispatcherId });
  }),
);

//set vehicle
router.put(
  "/:id/vehicles",
  authenticate,
  requirePermission("drivers.update"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "Invalid driver id" });
      return;
    }

    const vehicleIds = req.body?.vehicleIds;
    if (
      !Array.isArray(vehicleIds) ||
      vehicleIds.some((x) => !Number.isInteger(Number(x)))
    ) {
      res.status(400).json({ error: "vehicleIds must be an array of integers" });
      return;
    }
    const ids = [...new Set(vehicleIds.map((x) => Number(x)))];

    const profile = await prisma.driverProfile.findUnique({ where: { driverId: id } });
    if (!profile || profile.deletedAt) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }

    if (ids.length > 0) {
      const count = await prisma.vehicle.count({
        where: { id: { in: ids }, deletedAt: null },
      });
      if (count !== ids.length) {
        res.status(400).json({ error: "One or more vehicles do not exist" });
        return;
      }
    }

    await prisma.$transaction([
      prisma.driverVehicle.deleteMany({ where: { driverId: id } }),
      ...ids.map((vehicleId) =>
        prisma.driverVehicle.create({ data: { driverId: id, vehicleId } }),
      ),
    ]);

    res.json({ driverId: id, vehicleIds: ids });
  }),
);

function parseDateInput(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

//req already authenticate; requirePermission("vacations.manage") must be applied
function canManageVacations(req: AuthRequest, driverId: number): boolean {
  const user = req.user;
  if (!user) return false;
  const isManager = user.roles.some((r) => r === "admin" || r === "dispatcher" || r === "hr");
  const isDriverOnly = user.roles.includes("driver") && !user.roles.some((r) => r === "admin" || r === "dispatcher" || r === "hr");
  if (isManager) return true;
  if (isDriverOnly) return driverId === user.id;
  return false;
}

//list vacations for a driver
router.get(
  "/:id/vacations",
  authenticate,
  requirePermission("drivers.view"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const profile = await prisma.driverProfile.findUnique({ where: { driverId: id } });
    if (!profile || profile.deletedAt) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }
    const vacations = await prisma.driverVacation.findMany({
      where: { driverId: id },
      orderBy: { startDate: "asc" },
    });
    res.json(vacations.map((v) => ({ id: v.id, startDate: v.startDate, endDate: v.endDate })));
  }),
);

//create vacation
router.post(
  "/:id/vacations",
  authenticate,
  requirePermission("vacations.manage"),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "Invalid driver id" });
      return;
    }
    if (!canManageVacations(req, id)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const start = parseDateInput(req.body?.startDate);
    const end = parseDateInput(req.body?.endDate);
    if (!start || !end) {
      res.status(400).json({ error: "startDate and endDate must be valid dates" });
      return;
    }
    if (start.getTime() > end.getTime()) {
      res.status(400).json({ error: "startDate must be before or equal to endDate" });
      return;
    }

    const profile = await prisma.driverProfile.findUnique({ where: { driverId: id } });
    if (!profile || profile.deletedAt) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }

    const created = await prisma.driverVacation.create({
      data: { driverId: id, startDate: start, endDate: end },
    });
    res.status(201).json({ id: created.id, startDate: created.startDate, endDate: created.endDate });
  }),
);

//update vacation
router.put(
  "/:id/vacations/:vacationId",
  authenticate,
  requirePermission("vacations.manage"),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const vacationId = Number(req.params.vacationId);
    if (!Number.isInteger(id) || !Number.isInteger(vacationId)) {
      res.status(400).json({ error: "Invalid driver or vacation id" });
      return;
    }
    if (!canManageVacations(req, id)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const start = parseDateInput(req.body?.startDate);
    const end = parseDateInput(req.body?.endDate);
    if (!start || !end) {
      res.status(400).json({ error: "startDate and endDate must be valid dates" });
      return;
    }
    if (start.getTime() > end.getTime()) {
      res.status(400).json({ error: "startDate must be before or equal to endDate" });
      return;
    }

    const existing = await prisma.driverVacation.findUnique({ where: { id: vacationId } });
    if (!existing || existing.driverId !== id) {
      res.status(404).json({ error: "Vacation not found" });
      return;
    }

    const updated = await prisma.driverVacation.update({
      where: { id: vacationId },
      data: { startDate: start, endDate: end },
    });
    res.json({ id: updated.id, startDate: updated.startDate, endDate: updated.endDate });
  }),
);

//delete vacation
router.delete(
  "/:id/vacations/:vacationId",
  authenticate,
  requirePermission("vacations.manage"),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const vacationId = Number(req.params.vacationId);
    if (!Number.isInteger(id) || !Number.isInteger(vacationId)) {
      res.status(400).json({ error: "Invalid driver or vacation id" });
      return;
    }
    if (!canManageVacations(req, id)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const existing = await prisma.driverVacation.findUnique({ where: { id: vacationId } });
    if (!existing || existing.driverId !== id) {
      res.status(404).json({ error: "Vacation not found" });
      return;
    }

    await prisma.driverVacation.delete({ where: { id: vacationId } });
    res.json({ deleted: true });
  }),
);

export default router;
