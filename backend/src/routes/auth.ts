import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { asyncHandler, authenticate, AuthRequest, requirePermission } from "../middleware/auth.js";

const router = Router();

const ROLE_SLUGS = ["admin", "hr", "dispatcher", "driver"] as const;

function signToken(userId: number) {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET!, { expiresIn });
}

router.post(
  "/register",
  authenticate,
  requirePermission("users.manage"),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone, role, licenseNo, licenseClass, licenseExpiry } =
      req.body ?? {};

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: "email, password, firstName and lastName are required" });
      return;
    }

    const roleSlug = ROLE_SLUGS.includes(role) ? role : "driver";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const data: {
      email: string;
      passwordHash: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      roles: { connect: { slug: string }[] };
      driverProfile?: { create: { licenseNo: string; licenseClass: string; licenseExpiry: Date } };
      dispatcherProfile?: { create: object };
    } = {
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phone ?? null,
      roles: { connect: [{ slug: roleSlug }] },
    };

    if (roleSlug === "driver") {
      if (!licenseNo || !licenseClass || !licenseExpiry) {
        res.status(400).json({ error: "licenseNo, licenseClass and licenseExpiry are required for drivers" });
        return;
      }
      data.driverProfile = { create: { licenseNo, licenseClass, licenseExpiry: new Date(licenseExpiry) } };
    } else if (roleSlug === "dispatcher") {
      data.dispatcherProfile = { create: {} };
    }

    const user = await prisma.user.create({ data });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [roleSlug],
      },
    });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { permissions: true } } },
    });

    if (!user || !user.isActive || user.deletedAt) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json({
      token: signToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.slug),
        permissions: [...new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.slug)))],
      },
    });
  }),
);

router.get("/me", authenticate, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
