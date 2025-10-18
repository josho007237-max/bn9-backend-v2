import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// ✅ ตั้งค่า CORS
const allowedOrigin = process.env.ALLOW_ORIGIN || '*';

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-code'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // สำคัญ: ให้ตอบ preflight ทุกเส้นทาง

// ✅ Body parser
app.use(express.json());

// ✅ Route ทดสอบว่าเซิร์ฟเวอร์ทำงาน
app.get('/health', (_, res) => {
  res.json({ ok: true });
});

// ✅ เริ่มต้นเซิร์ฟเวอร์
app.listen(process.env.PORT || 3001, () => {
  console.log('✅ BN9 Backend v2 running on port', process.env.PORT || 3001);
});


