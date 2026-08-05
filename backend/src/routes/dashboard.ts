import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate } from "../middleware/auth.js";

const router = Router();

router.get(
  "/stats",
  authenticate,
  asyncHandler(async (_req, res) => {
    const [activeDrivers, offlineDrivers, totalVehicles, activeAssignments] =
      await Promise.all([
        prisma.user.count({
          where: {
            roles: { some: { slug: "driver" } },
            deletedAt: null,
            driverProfile: { is: { status: { not: "OFFLINE" } } },
          },
        }),
        prisma.user.count({
          where: {
            roles: { some: { slug: "driver" } },
            deletedAt: null,
            driverProfile: { is: { status: "OFFLINE" } },
          },
        }),
        prisma.vehicle.count({ where: { deletedAt: null } }),
        prisma.assignment.count({ where: { status: "ACTIVE" } }),
      ]);

    res.json({ activeDrivers, offlineDrivers, totalVehicles, activeAssignments });
  }),
);

export default router;
