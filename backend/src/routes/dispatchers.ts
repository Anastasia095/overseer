import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate, requirePermission } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("dispatchers.view"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: {
        roles: { some: { slug: "dispatcher" } },
        deletedAt: null,
        dispatcherProfile: { is: { deletedAt: null } },
      },
      orderBy: { firstName: "asc" },
    });

    res.json(
      users.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
      })),
    );
  }),
);

export default router;
