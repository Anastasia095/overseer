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
      include: { driverProfile: { include: { dispatcher: true } } },
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
          dispatcher: profile.dispatcher
            ? `${profile.dispatcher.firstName} ${profile.dispatcher.lastName}`
            : null,
          phone: u.phone,
        };
      });

    res.json(drivers);
  }),
);

export default router;
