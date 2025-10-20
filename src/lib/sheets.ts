// src/lib/sheets.ts
import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

let sheetsClient: sheets_v4.Sheets | null = null;

/** คืน Google Sheets client (lazy สร้างครั้งเดียวแล้วจำไว้) */
export function getSheets(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Missing Google credentials");
  }

  // ✅ ใช้รูปแบบ options object ตาม googleapis ปัจจุบัน
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

/** ตัวอย่าง: append แถวลงชีต */
export async function appendRow(
  spreadsheetId: string,
  range: string,
  row: (string | number)[]
): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** ค่าคงที่จาก ENV (ตั้งใน Railway → Variables ให้ตรงชื่อ) */
export const SHEET_ID = process.env.SHEET_ID ?? "";
export const SHEETS_RANGE = process.env.SHEETS_RANGE ?? "'Cases'!A:Z";

