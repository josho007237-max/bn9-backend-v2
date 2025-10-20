import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ---- Strict CORS (อ่านจาก ALLOW_ORIGINS) ----
const allowedOrigins = (process.env.ALLOW_ORIGINS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const isOriginAllowed = (origin?: string) => {
  if (!origin) return false;
  return allowedOrigins.some(p => {
    if (p.startsWith("*.")) return origin.endsWith(p.slice(1)); // เช่น *.example.com
    return origin === p;
  });
};

app.use(
  cors({
    origin(origin, cb) {
      cb(null, isOriginAllowed(origin ?? undefined));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-code"],
    maxAge: 86400,
  })
);
app.options("*", cors());
app.use(express.json({ limit: "2mb" }));

// Health
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Guard
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminHeader = (req.headers["x-admin-code"] || "") as string;
  const expected = process.env.ADMIN_CODE || "";
  if (!expected || adminHeader !== expected) {
    return res.status(401).json({ status: "error", message: "unauthorized" });
  }
  next();
}

// Demo API
app.get("/api/stats/:tenant", requireAdmin, (req, res) => {
  const { tenant } = req.params;
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  res.json({
    tenant,
    window: { from: from.toISOString(), to: now.toISOString() },
    metrics: { messages: 123, uniqueUsers: 45, urgent: 7, duplicateWithin15m: 4 },
    status: "ok" as const,
  });
});

// 404
app.use((_req, res) => res.status(404).json({ status: "error", message: "not found" }));

// Start
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server ready on http://0.0.0.0:${PORT}`);
});
