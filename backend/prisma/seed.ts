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
    description: "Manages driver/dispatcher accounts, vehicles, and fleet documentation",
    permissionSlugs: [
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
    ],
  },
] as const;

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
  const camry = await prisma.vehicle.findUnique({ where: { vin: "4T1G11AK2MU123456" } });
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
          status: "SCHEDULED",
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 8),
        },
      });
    }
  }

  console.log("Seeded roles, permissions, users, drivers, vehicles, and an assignment.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
