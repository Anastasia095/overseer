import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate, requirePermission } from "../middleware/auth.js";

const router = Router();

//get all drivers
router.get(
  "/",
  //MIDDLEWARE: 
  authenticate,
  requirePermission("drivers.view"),

  // ERROR HANDLING Wrapper 
  asyncHandler(async (_req, res) => {

    // DATABASE QUERY
    const users = await prisma.user.findMany({
      // Filter: Only get active users (not deleted) who have the "driver" role
      where: {
        roles: { some: { slug: "driver" } },
        deletedAt: null
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
        driverVehicles: { select: { vehicleId: true } },
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

      vehicleIds: user.driverVehicles.map((dv) => dv.vehicleId),
      lastLat: profile.lastLat,
      lastLng: profile.lastLng,
      lastLocationAt: profile.lastLocationAt,

      createdAt: user.createdAt,
    };

    res.json(driver);
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

export default router;
