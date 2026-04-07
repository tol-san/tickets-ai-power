import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../lib/prisma";

const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
    throw new Error("Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in server/.env");
}

if (adminPassword.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters long");
}

const normalizedEmail = adminEmail.trim().toLowerCase();
const passwordHash = await hashPassword(adminPassword);

const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
        role: "admin",
        name: "Admin User",
    },
    create: {
        email: normalizedEmail,
        name: "Admin User",
        role: "admin",
        emailVerified: true,
    },
});

await prisma.account.deleteMany({
    where: {
        userId: user.id,
        providerId: "credential",
        NOT: {
            accountId: user.id,
        },
    },
});

await prisma.account.upsert({
    where: {
        providerId_accountId: {
            providerId: "credential",
            accountId: user.id,
        },
    },
    update: {
        password: passwordHash,
        userId: user.id,
        accountId: user.id,
    },
    create: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
    },
});

console.log(`Seeded admin user: ${normalizedEmail}`);

await prisma.$disconnect();