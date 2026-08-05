import cron from "node-cron";
import { prisma } from "../prisma.js";

async function recordCurrentMonth() {
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeDrivers, totalVehicles] = await Promise.all([
    prisma.user.count({
      where: {
        roles: { some: { slug: "driver" } },
        deletedAt: null,
        driverProfile: { is: { status: { not: "OFFLINE" } } },
      },
    }),
    prisma.vehicle.count({ where: { deletedAt: null } }),
  ]);

  await prisma.statSnapshot.upsert({
    where: { month },
    update: { activeDrivers, totalVehicles },
    create: { month, activeDrivers, totalVehicles },
  });
}

export function startStatSnapshotJob() {
  recordCurrentMonth().catch((err) => {
    console.error("Stat snapshot failed:", err);
  });
  cron.schedule("30 1 * * *", () => {
    recordCurrentMonth().catch((err) => {
      console.error("Stat snapshot failed:", err);
    });
  });
}
