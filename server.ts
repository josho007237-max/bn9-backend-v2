// server.ts
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import dotenv from "dotenv";

// โหลด environment variables จากไฟล์ .env สำหรับ local development
dotenv.config();

// Node 18+ มี fetch ในตัวแล้ว ไม่ต้อง node-fetch

// ---------- ENV ----------
const PORT = process.env.PORT || 3001;
const ADMIN_CODE = process.env.ADMIN_CODE; // ควรตั้งค่าใน .env หรือ Railway เท่านั้น
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SHEET_ID = process.env.SHEET_ID; // <-- ใส่ใน Railway
const TAB = process.env.SHEETS_TAB ?? "กรณี"; // ชื่อแท็บ (ภาษาไทยได้)
const COLS = (process.env.SHEETS_COLS ?? "A:Z").replace(/\s/g, ""); // ตัดช่องว่างเผื่อพิมพ์ผิด
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

// ---------- Google Sheets client ----------
const auth = new google.auth.JWT(
  GOOGLE_SERVICE_ACCOUNT_EMAIL, // service account email
  undefined,
  GOOGLE_PRIVATE_KEY,
  ["https://www.googleapis.com/auth/spreadsheets.readonly"]
);
const sheets = google.sheets({ version: "v4", auth });

// ประกอบ range ให้ปลอดภัยเสมอ
const buildRange = (tab: string, cols: string) => {
  const safeTab = `'${tab.replace(/'/g, "''")}'`; // คร่อมด้วย '...' และ escape ' → ''
  return `${safeTab}!${cols}`;                     // << ไม่มีช่องว่างหลัง !
};

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Health ----------
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ---------- Chat (OpenAI เดิมของน้อง) ----------
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "missing message" });
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "คุณคือพี่พลอย BN9 แอดมินผู้ช่วย พูดสุภาพ อบอุ่น" },
          { role: "user", content: message },
        ],
      }),
    });
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content || "พี่พลอยตอบไม่ออกค่า 😅";
    res.json({ reply });
  } catch (err: unknown) {
    console.error("OpenAI API error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "OpenAI failed", details: errorMessage });
  }
});

// ---------- ตัวอย่าง route อ่าน Google Sheets ----------
app.get("/api/stats/:tenant", async (req, res) => {
  // ป้องกันด้วย admin code (ให้ FE ส่ง header x-admin-code มา)
  if (!ADMIN_CODE) {
    console.error("ADMIN_CODE is not set.");
    // ไม่เปิดเผยข้อมูลภายในสู่ภายนอก
    return res.status(500).json({ error: "server misconfiguration" });
  }

  if ((req.header("x-admin-code") || "") !== ADMIN_CODE) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    if (!SHEET_ID) throw new Error("missing SHEET_ID env");

    const range = buildRange(TAB, COLS); // เช่น `'กรณี'!A:Z`
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    // ตัวอย่างสรุปผลแบบง่ายกลับไปก่อน
    const rows = data.values ?? [];
    res.json({
      status: "ok",
      window: { from: null, to: null },
      metrics: {
        totalMessages: Math.max(0, rows.length - 1), // ลบหัวตารางคร่าว ๆ
        newCustomers: 0,
        urgent: 0,
        duplicateWithin15m: 0,
      },
    });
  } catch (e: unknown) {
    let errorDetails: any = e;
    if (e instanceof Error) {
      errorDetails = { message: e.message, stack: e.stack };
      if ('response' in e) {
        errorDetails.response = (e as any).response?.data;
      }
    }
    console.error("Sheets error:", errorDetails);

    // ส่งข้อความชัด ๆ เวลา range ผิด
    res.status(500).json({
      error: `Sheets failed (range=${buildRange(TAB, COLS)})`,
      details: (e as any)?.response?.data?.error?.message || (e instanceof Error ? e.message : "Unknown error"),
    });
  }
});

app.listen(PORT, () => {
  console.log("✅ Backend ready on", PORT);
  if (!ADMIN_CODE) {
    console.warn("⚠️ ADMIN_CODE is not set. API routes will be inaccessible.");
  }
  if (!SHEET_ID) {
    console.warn("⚠️ SHEET_ID is not set. Google Sheets integration will fail.");
  }
});
