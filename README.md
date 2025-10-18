# BN9 Backend v2

Express + TypeScript backend for BN9 Command Center.

## Run local
```bash
cp .env.example .env
npm i
npm run build
npm start
# Test
curl http://localhost:3001/health
curl http://localhost:3001/version
curl -H "x-admin-code: 007237" http://localhost:3001/api/stats/demo
```
## Deploy (Railway)
- Add Variables: `PORT, SUPER_ADMIN_CODE, ALLOW_ORIGIN, OPENAI_* (optional), SHEETS_ID, SHEETS_TAB`
- Set Start Command: `npm start` (default from package.json)
