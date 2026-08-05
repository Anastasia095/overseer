import { Router } from "express";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate } from "../middleware/auth.js";

const router = Router();

function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

router.get(
  "/stats",
  authenticate,
  asyncHandler(async (_req, res) => {
    const now = new Date();

    const [activeDrivers, totalVehicles, activeLoads, snapshots, assignments] =
      await Promise.all([
        prisma.user.count({
          where: {
            roles: { some: { slug: "driver" } },
            deletedAt: null,
            driverProfile: { is: { status: { not: "OFFLINE" } } },
          },
        }),
        prisma.vehicle.count({ where: { deletedAt: null } }),
        prisma.assignment.count({ where: { status: "ACTIVE" } }),
        prisma.statSnapshot.findMany({ orderBy: { month: "asc" } }),
        prisma.assignment.findMany({
          select: { createdAt: true, completedAt: true, cancelledAt: true },
        }),
      ]);

    const monthly = new Map<
      string,
      { label: string; activeDrivers: number; totalVehicles: number }
    >();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthly.set(`${d.getFullYear()}-${d.getMonth()}`, {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        activeDrivers: 0,
        totalVehicles: 0,
      });
    }
    for (const s of snapshots) {
      const key = `${s.month.getFullYear()}-${s.month.getMonth()}`;
      const bucket = monthly.get(key);
      if (bucket) {
        bucket.activeDrivers = s.activeDrivers;
        bucket.totalVehicles = s.totalVehicles;
      }
    }

    const weekly = new Map<
      string,
      { label: string; dispatched: number; completed: number; cancelled: number }
    >();
    for (let i = 11; i >= 0; i--) {
      const d = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      weekly.set(isoDate(d), {
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dispatched: 0,
        completed: 0,
        cancelled: 0,
      });
    }
    for (const a of assignments) {
      const wk = weekly.get(isoDate(startOfWeek(a.createdAt)));
      if (wk) wk.dispatched += 1;
      if (a.completedAt) {
        const cwk = weekly.get(isoDate(startOfWeek(a.completedAt)));
        if (cwk) cwk.completed += 1;
      }
      if (a.cancelledAt) {
        const xwk = weekly.get(isoDate(startOfWeek(a.cancelledAt)));
        if (xwk) xwk.cancelled += 1;
      }
    }

    res.json({
      activeDrivers,
      totalVehicles,
      activeLoads,
      monthly: [...monthly.values()],
      weekly: [...weekly.values()],
    });
  }),
);

export default router;
