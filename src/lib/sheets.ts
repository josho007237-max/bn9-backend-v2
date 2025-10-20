// src/lib/sheets.ts
import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

let sheetsClient: sheets_v4.Sheets | null = null;

/** สร้าง client แบบ lazy กันแอพล้มตั้งแต่บูต */
export function getSheets(): sheets_v4.Sheets | null {
  if (sheetsClient) return sheetsClient;

  try {
    // --- ใช้วิธี EMAIL + PRIVATE_KEY ---
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    if (!email || !key) throw new Error("Missing Google credentials");

    const auth = new google.auth.JWT(
      email,
      undefined,
      key,
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    sheetsClient = google.sheets({ version: "v4", auth });
    console.log("✅ Sheets client ready");
    return sheetsClient;
  } catch (err: any) {
    console.error("❌ Sheets init failed:", err?.message || err);
    return null; // อย่าทำให้แอพล้ม
  }
}

// ค่าคงที่จาก ENV (ตั้งชื่อให้ตรงกับ Railway)
export const SHEET_ID = process.env.SHEET_ID!; // <-- ชื่อให้ตรง: SHEET_ID
export const SHEETS_RANGE = process.env.SHEETS_RANGE || "'Cases'!A:Z";
