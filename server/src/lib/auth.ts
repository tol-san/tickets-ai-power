import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { prisma } from "./prisma";

const defaultClientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const trustedOriginsFromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const trustedOrigins = Array.from(
    new Set([defaultClientOrigin, "http://localhost:5173", "http://localhost:5174", ...trustedOriginsFromEnv]),
);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001/api/auth",
    trustedOrigins,
    database: prismaAdapter(prisma, {
        provider: "mysql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        disableSignUp: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "agent",
                input: false,
            },
        },
    },
});
