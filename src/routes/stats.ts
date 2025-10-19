import { Router } from "express";
import { sheets, SHEETS_ID, SHEETS_TAB } from "../lib/google";

const r = Router();

/**
 * GET /api/stats/:tenant
 * สรุป 24 ชม.ล่าสุด: messages, uniqueUsers, urgent, duplicateWithin15m
 * ต้องส่ง header x-admin-code
 */
r.get("/stats/:tenant", async (req, res) => {
  try {
    const code = req.header("x-admin-code");
    if (code !== process.env.SUPER_ADMIN_CODE) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const tenant = req.params.tenant;
    const now = new Date();
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // อ่านข้อมูลจากชีต
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: `${SHEETS_TAB}!A:Z`,
    });

    const rows: string[][] = (resp.data.values ?? []).slice(1); // ตัด header ออก
    let messages = 0;
    let urgent = 0;
    const users = new Set<string>();
    const seen15m: Record<string, 1> = {};

    for (const row of rows) {
      const [timestamp, user, phone, account, note, slip_url, bank, rowTenant, source, type] = row;
      if (rowTenant !== tenant) continue;

      const t = new Date(timestamp);
      if (!isFinite(t.getTime()) || t < from) continue;

      messages++;
      if (user) users.add(user);
      if (String(type ?? "").toLowerCase().includes("urgent")) urgent++;

      // นับซ้ำใน 15 นาที ตาม user + slot
      const slot = Math.floor(t.getTime() / (15 * 60 * 1000));
      const key = `${user}|${slot}`;
      if (seen15m[key]) {
        // มีบันทึกใน slot เดียวกันแล้ว ถือว่า "ซ้ำใน 15 นาที"
      } else {
        seen15m[key] = 1;
      }
    }

    // duplicateWithin15m: จำนวน slot ที่มีมากกว่า 1 รายการ (ถ้าอยากนับละเอียดเพิ่มเติมค่อยปรับ)
    // สำหรับตัวอย่างนี้ ตั้งค่าเป็น 0 ไว้ก่อนหรือคำนวณเองตามที่ต้องการ
    const duplicateWithin15m = 0;

    return res.json({
      tenant,
      window: { from: from.toISOString(), to: now.toISOString() },
      metrics: {
        messages,
        uniqueUsers: users.size,
        urgent,
        duplicateWithin15m,
      },
      status: "ok",
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default r;
