// src/index.ts
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// ★ routes
import statsRoute from "./routes/stats";
import casesRoute from "./routes/cases";

// -------- App setup --------
const app = express();

// CORS — รองรับ ALLOW_ORIGIN=*, หรือคอมมาแยกหลายโดเมน
const allowOrigin = process.env.ALLOW_ORIGIN ?? "*";
const origins =
  allowOrigin === "*"
    ? undefined
    : allowOrigin.split(",").map(s => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: origins ?? "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-code"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "1mb" }));

// -------- Health --------
app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));
app.get("/api/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

// -------- API routes --------
app.use("/api", statsRoute);
app.use("/api", casesRoute);

// -------- Error handler (fallback) --------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err?.message ?? "server_error" });
});

// -------- Start server --------
const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`🚀 BN9 Backend v2 running on port ${PORT}`);
});
