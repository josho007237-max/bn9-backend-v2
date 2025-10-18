import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { auth } from './middlewares/auth.js';
import { healthRouter } from './routes/health.js';
import { versionRouter } from './routes/version.js';
import { statsRouter } from './routes/stats.js';
import { activityRouter } from './routes/activity.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOW_ORIGIN?.split(',') || '*' }));

app.use('/health', healthRouter);
app.use('/version', versionRouter);
app.use('/api/stats', auth, statsRouter);
app.use('/api/activity', auth, activityRouter);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`[bn9-backend-v2] listening on :${port}`);
});
