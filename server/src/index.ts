import cors from "cors";
import express from "express";
import session from "express-session";
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "./lib/auth-constants";
import { prisma } from "./lib/prisma";
import { PrismaSessionStore } from "./lib/session-store";
import { authRouter } from "./routes/auth";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret && isProduction) {
    throw new Error("SESSION_SECRET is required in production.");
}

app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true,
    }),
);
app.use(express.json());
app.use(
    session({
        name: SESSION_COOKIE_NAME,
        secret: sessionSecret ?? "dev-only-change-me",
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore(prisma),
        cookie: {
            maxAge: SESSION_TTL_MS,
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction,
        },
    }),
);

app.use("/api/auth", authRouter);

app.get("/api/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: "ok",
            service: "tickets-ai-power-api",
            database: "connected",
            now: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            service: "tickets-ai-power-api",
            database: "disconnected",
            now: new Date().toISOString(),
            message: error instanceof Error ? error.message : "Unknown database error",
        });
    }
});

app.get("/", (_req, res) => {
    res.send("Express API is running.");
});

app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
