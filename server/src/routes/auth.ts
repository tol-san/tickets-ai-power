import { Router } from "express";
import type { Request } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { SESSION_COOKIE_NAME } from "../lib/auth-constants";
import { requireAuth } from "../middleware/require-auth";

const authRouter = Router();

type SafeUser = {
    id: number;
    email: string;
    role: string;
    createdAt: Date;
};

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
}

function saveSession(req: Request, userId: number): Promise<void> {
    req.session.userId = userId;

    return new Promise((resolve, reject) => {
        req.session.save((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function toSafeUser(user: SafeUser) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}

authRouter.post("/register", async (req, res) => {
    try {
        const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";
        const email = normalizeEmail(rawEmail);

        if (!isValidEmail(email)) {
            res.status(400).json({ message: "A valid email is required." });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters." });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
            res.status(409).json({ message: "Email is already in use." });
            return;
        }

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        await saveSession(req, user.id);
        res.status(201).json({ user: toSafeUser(user) });
    } catch (error) {
        res.status(500).json({
            message: "Failed to register.",
            details: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.message : "Unknown error",
        });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";
        const email = normalizeEmail(rawEmail);

        if (!isValidEmail(email) || password.length === 0) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }

        const isMatch = await verifyPassword(password, user.passwordHash);

        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }

        await saveSession(req, user.id);
        res.json({
            user: toSafeUser({
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            }),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to login.",
            details: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.message : "Unknown error",
        });
    }
});

authRouter.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie(SESSION_COOKIE_NAME);
        res.status(204).send();
    });
});

authRouter.get("/me", requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        res.json({ user: toSafeUser(user) });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get current user.",
            details: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export { authRouter };
