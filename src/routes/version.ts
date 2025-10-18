import { Router } from 'express';
export const versionRouter = Router();
const buildTime = new Date().toISOString();
versionRouter.get('/', (_, res) => res.json({ version: 'v2.0.0', buildTime }));
