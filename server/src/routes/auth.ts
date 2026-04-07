import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { toPublicUser } from "../lib/auth-utils";

const authRouter = Router();

authRouter.get("/me", async (req, res) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        res.json({ user: toPublicUser(session.user as Parameters<typeof toPublicUser>[0]) });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get current user.",
            details: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export { authRouter };
