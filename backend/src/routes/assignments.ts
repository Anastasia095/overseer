import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate, requirePermission } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import type { AssignmentStatus } from "../generated/prisma/enums.js";

const router = Router();

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// group filter param into assignment statuses
const STATUS_GROUPS: Record<string, AssignmentStatus[]> = {
  active: ["SCHEDULED", "ACTIVE"],
  completed: ["COMPLETED", "CANCELLED"],
};

router.get(
  "/",
  authenticate,
  requirePermission("assignments.view"),

  asyncHandler(async (req: AuthRequest, res) => {
    const page = Math.max(1, Number(req.query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));

    const group = typeof req.query.status === "string" ? req.query.status.toLowerCase() : "";
    const statuses = STATUS_GROUPS[group];
    const statusFilter = statuses ? { status: { in: statuses } } : {};

    const isDispatcherOnly =
      req.user?.roles.includes("dispatcher") &&
      !req.user?.roles.some((r) => r === "admin" || r === "hr");

    const where = {
      ...statusFilter,
      ...(isDispatcherOnly ? { dispatcherId: req.user!.id } : {}),
    };

    const [total, assignments] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          driver: { select: { id: true, firstName: true, lastName: true } },
          vehicle: { select: { id: true, make: true, model: true, year: true, plate: true } },
        },
      }),
    ]);

    res.json({
      data: assignments.map((a) => ({
        id: a.id,
        status: a.status,
        driverId: a.driver.id,
        driverName: `${a.driver.firstName} ${a.driver.lastName}`,
        vehicleId: a.vehicle.id,
        vehicleName: `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}`,
        vehiclePlate: a.vehicle.plate,
        origin: a.origin,
        destination: a.destination,
        assignedAt: a.assignedAt,
        startsAt: a.startsAt,
        endsAt: a.endsAt,
        completedAt: a.completedAt,
        cancelledAt: a.cancelledAt,
        createdAt: a.createdAt,
      })),
      total,
      page,
      limit,
    });
  }),
);

export default router;