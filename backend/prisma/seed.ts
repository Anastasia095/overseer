import { prisma } from "../src/prisma.js";

const SEED_PASSWORD = "password123";

const permissionDefs = [
  { slug: "users.manage", name: "Manage users", description: "Create and manage staff accounts" },
  { slug: "drivers.view", name: "View drivers", description: "View driver records" },
  { slug: "drivers.create", name: "Create drivers", description: "Create driver records" },
  { slug: "drivers.update", name: "Update drivers", description: "Update driver records" },
  { slug: "drivers.delete", name: "Delete drivers", description: "Delete driver records" },
  { slug: "dispatchers.view", name: "View dispatchers", description: "View dispatcher records" },
  { slug: "dispatchers.create", name: "Create dispatchers", description: "Create dispatcher records" },
  { slug: "dispatchers.update", name: "Update dispatchers", description: "Update dispatcher records" },
  { slug: "dispatchers.delete", name: "Delete dispatchers", description: "Delete dispatcher records" },
  { slug: "vehicles.view", name: "View vehicles", description: "View vehicle records" },
  { slug: "vehicles.create", name: "Create vehicles", description: "Create vehicle records" },
  { slug: "vehicles.update", name: "Update vehicles", description: "Update vehicle records" },
  { slug: "vehicles.delete", name: "Delete vehicles", description: "Delete vehicle records" },
  { slug: "assignments.view", name: "View assignments", description: "View trip assignments" },
  { slug: "assignments.create", name: "Create assignments", description: "Create trip assignments" },
  { slug: "assignments.update", name: "Update assignments", description: "Update trip assignments" },
  { slug: "assignments.delete", name: "Delete assignments", description: "Delete trip assignments" },
  { slug: "telemetry.view", name: "View telemetry", description: "View live driver telemetry" },
  { slug: "telemetry.ingest", name: "Ingest telemetry", description: "Submit GPS telemetry from the device" },
  { slug: "vacations.manage", name: "Manage vacations", description: "Create and edit driver vacation days" },
] as const;

const roleDefs = [
  {
    slug: "admin",
    name: "Administrator",
    description: "Super user with full access, including staff account management",
    permissionSlugs: permissionDefs.map((p) => p.slug),
  },
  {
    slug: "hr",
    name: "HR",
    description: "Manages driver/dispatch accounts, vehicles, and fleet documentation",
    permissionSlugs: [
      "users.manage",
      "drivers.view", "drivers.create", "drivers.update", "drivers.delete",
      "dispatchers.view", "dispatchers.create", "dispatchers.update", "dispatchers.delete",
      "vehicles.view", "vehicles.create", "vehicles.update", "vehicles.delete",
      "assignments.view", "assignments.create", "assignments.update", "assignments.delete",
      "telemetry.view",
    ],
  },
  {
    slug: "dispatcher",
    name: "Dispatcher",
    description: "Operational: monitors drivers, manages scheduling and assignments",
    permissionSlugs: [
      "drivers.view",
      "vehicles.view",
      "assignments.view", "assignments.create", "assignments.update", "assignments.delete",
      "telemetry.view",
      "vacations.manage",
    ],
  },
  {
    slug: "driver",
    name: "Driver",
    description: "Vehicle operator using the Android telemetry app",
    permissionSlugs: [
      "drivers.view",
      "assignments.view",
      "telemetry.ingest",
      "vacations.manage",
    ],
  },
] as const;

function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function seedHistoricalLoads(opts: {
  driver1: { id: number };
  driver2: { id: number };
  camry: { id: number };
  transit: { id: number };
  dispatcherId: number;
}) {
  // Demo history only: wipe previously seeded COMPLETED/CANCELLED loads so the
  // seed stays idempotent across runs. Real in-flight loads are left untouched.
  await prisma.assignment.deleteMany({
    where: { status: { in: ["COMPLETED", "CANCELLED"] } },
  });

  const demoRoutes = [
    { origin: "Los Angeles, CA", destination: "Las Vegas, NV" },
    { origin: "Phoenix, AZ", destination: "Tucson, AZ" },
    { origin: "San Diego, CA", destination: "Bakersfield, CA" },
    { origin: "Sacramento, CA", destination: "Reno, NV" },
    { origin: "San Jose, CA", destination: "Fresno, CA" },
    { origin: "Oakland, CA", destination: "Modesto, CA" },
  ];

  const now = new Date();
  const thisMonday = startOfWeek(now);
  const drivers = [opts.driver1, opts.driver2];
  const vehicles = [opts.camry, opts.transit];

  for (let w = 8; w >= 1; w--) {
    const monday = new Date(thisMonday.getTime() - w * 7 * 24 * 60 * 60 * 1000);
    const completedCount = w % 2 === 0 ? 2 : 3;
    const route = demoRoutes[(w + completedCount) % demoRoutes.length];

    for (let i = 0; i < completedCount; i++) {
      await prisma.assignment.create({
        data: {
          driverId: drivers[i % drivers.length].id,
          vehicleId: vehicles[i % vehicles.length].id,
          dispatcherId: opts.dispatcherId,
          status: "COMPLETED",
          origin: route.origin,
          destination: route.destination,
          createdAt: new Date(monday.getTime() + i * 3600 * 1000),
          assignedAt: new Date(monday.getTime() + i * 3600 * 1000),
          startsAt: new Date(monday.getTime() + i * 3600 * 1000),
          endsAt: new Date(monday.getTime() + (i + 6) * 3600 * 1000),
          completedAt: new Date(monday.getTime() + (i + 5) * 3600 * 1000),
        },
      });
    }

    await prisma.assignment.create({
      data: {
        driverId: drivers[completedCount % drivers.length].id,
        vehicleId: vehicles[completedCount % vehicles.length].id,
        dispatcherId: opts.dispatcherId,
        status: "CANCELLED",
        origin: route.origin,
        destination: route.destination,
        createdAt: new Date(monday.getTime() + 2 * 3600 * 1000),
        assignedAt: new Date(monday.getTime() + 2 * 3600 * 1000),
        startsAt: new Date(monday.getTime() + 2 * 3600 * 1000),
        cancelledAt: new Date(monday.getTime() + 3 * 3600 * 1000),
      },
    });
  }
}

async function seedStatSnapshots() {
  const now = new Date();
  for (let m = 8; m >= 1; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const activeDrivers = 4 + (8 - m);
    const totalVehicles = 6 + (8 - m) * 2;
    await prisma.statSnapshot.upsert({
      where: { month },
      update: { activeDrivers, totalVehicles },
      create: { month, activeDrivers, totalVehicles },
    });
  }
}

type VacationRange = Record<number, Array<{ startDate: Date; endDate: Date }>>;

function dateFromNow(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seedVacations(rangesByDriver: VacationRange) {
  const driverIds = Object.keys(rangesByDriver).map(Number);
  await prisma.driverVacation.deleteMany({
    where: { driverId: { in: driverIds } },
  });
  for (const [driverId, ranges] of Object.entries(rangesByDriver)) {
    for (const range of ranges) {
      await prisma.driverVacation.create({
        data: { driverId: Number(driverId), ...range },
      });
    }
  }
}

async function main() {
  const passwordHash = await import("bcryptjs").then(({ hash }) => hash(SEED_PASSWORD, 10));

  const permissionIds: Record<string, number> = {};
  for (const def of permissionDefs) {
    const perm = await prisma.permission.upsert({
      where: { slug: def.slug },
      update: { name: def.name, description: def.description },
      create: { slug: def.slug, name: def.name, description: def.description },
    });
    permissionIds[def.slug] = perm.id;
  }

  const roleIds: Record<string, number> = {};
  for (const def of roleDefs) {
    const permissionList = def.permissionSlugs.map((slug) => ({ id: permissionIds[slug] }));
    const role = await prisma.role.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        description: def.description,
        permissions: { set: permissionList },
      },
      create: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        permissions: { connect: permissionList },
      },
    });
    roleIds[def.slug] = role.id;
  }

  const dispatcher = await prisma.user.upsert({
    where: { email: "dispatcher@overseer.dev" },
    update: {},
    create: {
      email: "dispatcher@overseer.dev",
      passwordHash,
      firstName: "Alex",
      lastName: "Rivera",
      phone: "+1 555-0101",
      roles: { connect: [{ slug: "dispatcher" }] },
      dispatcherProfile: { create: {} },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@overseer.dev" },
    update: {},
    create: {
      email: "admin@overseer.dev",
      passwordHash,
      firstName: "Sam",
      lastName: "Taylor",
      phone: "+1 555-0199",
      roles: { connect: [{ slug: "admin" }] },
    },
  });

  await prisma.user.upsert({
    where: { email: "hr@overseer.dev" },
    update: {},
    create: {
      email: "hr@overseer.dev",
      passwordHash,
      firstName: "Jordan",
      lastName: "Lee",
      phone: "+1 555-0188",
      roles: { connect: [{ slug: "hr" }] },
    },
  });

  const drivers = [
    {
      email: "driver1@overseer.dev",
      firstName: "John",
      lastName: "Carter",
      phone: "+1 555-0102",
      licenseNo: "DL-1234567",
      licenseClass: "C",
      licenseExpiry: new Date("2027-01-15"),
      status: "AVAILABLE",
      lastLat: 34.0522,
      lastLng: -118.2437,
      lastLocationAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      email: "driver2@overseer.dev",
      firstName: "Maria",
      lastName: "Santos",
      phone: "+1 555-0103",
      licenseNo: "DL-7654321",
      licenseClass: "CD",
      licenseExpiry: new Date("2026-11-30"),
      status: "EN_ROUTE",
      lastLat: 34.0783,
      lastLng: -118.1562,
      lastLocationAt: new Date(Date.now() - 1000 * 60 * 2),
    },
  ] as const;

  for (const d of drivers) {
    await prisma.user.upsert({
      where: { email: d.email },
      update: {
        driverProfile: {
          update: {
            lastLat: d.lastLat,
            lastLng: d.lastLng,
            lastLocationAt: d.lastLocationAt,
          },
        },
      },
      create: {
        email: d.email,
        passwordHash,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        roles: { connect: [{ slug: "driver" }] },
        driverProfile: {
          create: {
            licenseNo: d.licenseNo,
            licenseClass: d.licenseClass,
            licenseExpiry: d.licenseExpiry,
            status: d.status,
            assignedDispatcherId: dispatcher.id,
            lastLat: d.lastLat,
            lastLng: d.lastLng,
            lastLocationAt: d.lastLocationAt,
          },
        },
      },
    });
  }

  const vehicles = [
    {
      make: "Toyota",
      model: "Camry",
      year: 2021,
      vin: "4T1G11AK2MU123456",
      plate: "ABC-1234",
      status: "AVAILABLE",
    },
    {
      make: "Ford",
      model: "Transit",
      year: 2019,
      vin: "1FTYR2ZM0KKA12345",
      plate: "XYZ-9876",
      status: "IN_USE",
    },
  ] as const;

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: v.vin },
      update: {},
      create: {
        make: v.make,
        model: v.model,
        year: v.year,
        vin: v.vin,
        plate: v.plate,
        status: v.status,
      },
    });
  }

  const driver1 = await prisma.user.findUnique({ where: { email: "driver1@overseer.dev" } });
  const driver2 = await prisma.user.findUnique({ where: { email: "driver2@overseer.dev" } });
  const camry = await prisma.vehicle.findUnique({ where: { vin: "4T1G11AK2MU123456" } });
  const transit = await prisma.vehicle.findUnique({ where: { vin: "1FTYR2ZM0KKA12345" } });

  if (driver1 && camry) {
    const existing = await prisma.assignment.findFirst({
      where: { driverId: driver1.id, vehicleId: camry.id },
    });
    if (!existing) {
      await prisma.assignment.create({
        data: {
          driverId: driver1.id,
          vehicleId: camry.id,
          dispatcherId: dispatcher.id,
          origin: "Los Angeles, CA",
          destination: "San Francisco, CA",
          status: "SCHEDULED",
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 8),
        },
      });
    } else if (existing.origin === null) {
      await prisma.assignment.update({
        where: { id: existing.id },
        data: {
          origin: "Los Angeles, CA",
          destination: "San Francisco, CA",
        },
      });
    }
  }

  if (driver1 && driver2 && camry && transit) {
    await seedHistoricalLoads({
      driver1,
      driver2,
      camry,
      transit,
      dispatcherId: dispatcher.id,
    });

    const vehicleLinks = [
      { driver: driver1, vehicle: camry },
      { driver: driver2, vehicle: transit },
    ];
    for (const link of vehicleLinks) {
      await prisma.driverVehicle.upsert({
        where: {
          driverId_vehicleId: {
            driverId: link.driver.id,
            vehicleId: link.vehicle.id,
          },
        },
        update: {},
        create: {
          driverId: link.driver.id,
          vehicleId: link.vehicle.id,
        },
      });
    }
  }

  if (driver1 && driver2 && camry && transit) {
    await seedVacations({
      [driver1.id]: [
        { startDate: dateFromNow(25), endDate: dateFromNow(31) },
        { startDate: dateFromNow(80), endDate: dateFromNow(84) },
      ],
      [driver2.id]: [
        { startDate: dateFromNow(45), endDate: dateFromNow(51) },
      ],
    });
  }

  await seedStatSnapshots();

  console.log(
    "Seeded roles, permissions, users, drivers, vehicles, loads, vacations, and monthly snapshots.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
