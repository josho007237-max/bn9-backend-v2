import { Router } from 'express';
export const statsRouter = Router();

statsRouter.get('/:tenant', async (req, res) => {
  const { tenant } = req.params;
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  res.json({
    tenant,
    window: { from: from.toISOString(), to: now.toISOString() },
    metrics: { messages: 0, uniqueUsers: 0, urgent: 0, duplicates15m: 0 }
  });
});
