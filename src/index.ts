import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const allowedOrigin = process.env.ALLOW_ORIGIN || '*';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-code'],
}));

// ✅ ให้ตอบ preflight (OPTIONS) ทุกเส้นทาง
app.options('*', cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-code'],
}));

app.use(express.json());

// ตัวอย่าง route health
app.get('/health', (_, res) => {
  res.json({ ok: true });
});

// (ส่วนอื่น ๆ เช่น version, api/stats/demo อยู่ด้านล่าง)
app.listen(process.env.PORT || 3001, () => {
  console.log('✅ BN9 Backend v2 running on port', process.env.PORT || 3001);
});

