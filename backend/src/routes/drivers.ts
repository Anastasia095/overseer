import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate, requirePermission } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("drivers.view"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { roles: { some: { slug: "driver" } }, deletedAt: null },
      include: {
        driverProfile: {
          include: {
            dispatcher: true,
          },
        },
        driverVehicles: { select: { vehicleId: true } },
      },
    });

    const drivers = users
      .filter((u) => u.driverProfile !== null)
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
