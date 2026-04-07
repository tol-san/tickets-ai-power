import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { prisma } from "./lib/prisma";
import { auth } from "./lib/auth";
import { authRouter } from "./routes/auth";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true,
    }),
);
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api", authRouter);

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
