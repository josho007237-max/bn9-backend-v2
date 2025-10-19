import { Router } from "express";
import { sheets, SHEETS_ID, SHEETS_TAB } from "../lib/google";

const r = Router();

/**
 * POST /api/cases
 * ต้องส่ง header x-admin-code และ body ตามฟิลด์ด้านล่าง
 */
r.post("/cases", async (req, res) => {
  try {
    const code = req.header("x-admin-code");
    if (code !== process.env.SUPER_ADMIN_CODE) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const {
      timestamp, user, phone, account, note, slip_url,
      bank, tenant, source, type,
    } = req.body ?? {};

    if (!timestamp || !tenant) {
      return res.status(400).json({ error: "missing fields" });
    }

    const values = [[
      timestamp ?? "",
      user ?? "",
      phone ?? "",
      account ?? "",
      note ?? "",
      slip_url ?? "",
      bank ?? "",
      tenant ?? "",
      source ?? "",
      type ?? "",
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEETS_ID,
      range: `${SHEETS_TAB}!A1`,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default r;
