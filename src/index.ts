import express from "express";
import cors from "cors";

const app = express();

// ----- Middlewares -----
const allowOrigin = process.env.ALLOW_ORIGIN ?? "*";
app.use(
  cors({
    origin: allowOrigin === "*" ? true : allowOrigin.split(","),
  })
);
app.use(express.json({ limit: "2mb" }));

// ----- Health endpoints (ตอบไวที่สุด วางไว้บนสุด) -----
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ----- Admin guard -----
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminHeader = (req.headers["x-admin-code"] || "") as string;
  const expected = process.env.ADMIN_CODE || "";
  if (!expected || adminHeader !== expected) {
    return res.status(401).json({ status: "error", message: "unauthorized" });
  }
  next();
}

// ----- Example API: /api/stats/:tenant -----
/**
 * demo logic: นับสถิติช่วง 24 ชม. ล่าสุดแบบ mock
 * ในโปรเจกต์จริง ให้ต่อ DB/Sheets แทนได้เลย
 */
app.get("/api/stats/:tenant", requireAdmin, (req, res) => {
  const { tenant } = req.params;

  // mock data สำหรับเดโม่
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const payload = {
    tenant,
    window: { from: from.toISOString(), to: now.toISOString() },
    metrics: {
      messages: 123,
      uniqueUsers: 45,
      urgent: 7,
      duplicateWithin15m: 4
    },
    status: "ok" as const
  };

  res.json(payload);
});

// ----- 404 fallback (ไม่บล็อก health) -----
app.use((_req, res) => res.status(404).json({ status: "error", message: "not found" }));

// ----- Start server (สำคัญ: ใช้ PORT ของ Railway และ bind 0.0.0.0) -----
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server ready on http://0.0.0.0:${PORT}`);
});
