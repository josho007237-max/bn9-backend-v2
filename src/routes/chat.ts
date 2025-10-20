import { Router, Request, Response } from "express";

const router = Router();

// ช่วยเลือกโมเดลจาก ENV ได้ (ไม่ตั้งจะใช้ gpt-4o-mini)
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ตัวช่วยเรียก OpenAI Chat Completions
async function callOpenAI(message: string, systemHint?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: systemHint || "คุณคือพี่พลอย BN9 ผู้ช่วยตอบคำถามลูกค้า พูดสุภาพ กระชับ เป็นมิตร" },
      { role: "user", content: message },
    ],
    temperature: 0.7,
  };

  // ใช้ fetch แบบ native (Node 18+)
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }

  const data: any = await resp.json();
  const reply: string =
    data?.choices?.[0]?.message?.content ?? "พี่พลอยตอบไม่ออกค่า 😅";
  return reply;
}

/**
 * POST /api/chat
 * body: { message: string, systemHint?: string }
 * headers (ถ้าต้องการป้องกัน): x-admin-code: {SUPER_ADMIN_CODE}
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // (ถ้าอยากเปิดใช้ guard ให้ตั้ง ENV SUPER_ADMIN_CODE ด้วย)
    const needGuard = !!process.env.SUPER_ADMIN_CODE;
    if (needGuard) {
      const code = req.header("x-admin-code");
      if (code !== process.env.SUPER_ADMIN_CODE) {
        return res.status(401).json({ error: "unauthorized" });
      }
    }

    const { message, systemHint } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "missing message" });
    }

    const reply = await callOpenAI(message, systemHint);
    res.json({ reply, model: OPENAI_MODEL });
  } catch (err: any) {
    console.error("[/api/chat] error:", err?.message || err);
    res.status(500).json({ error: "failed_to_call_openai" });
  }
});

export default router;
