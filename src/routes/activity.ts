import { Router } from 'express';
export const activityRouter = Router();

activityRouter.get('/:tenant', async (req, res) => {
  const { tenant } = req.params;
  const limit = Number(req.query.limit || 50);
  res.json({
    tenant,
    items: [
      {
        ts: new Date().toISOString(),
        userId: "demo-user",
        text: "สวัสดีครับ",
        category: "อื่นๆ",
        emotion: "ปกติ",
        tone: "สุภาพ",
        urgent: false,
        source: "LINE"
      }
    ].slice(0, limit)
  });
});
