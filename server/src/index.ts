import cors from "cors";
import express from "express";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

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
