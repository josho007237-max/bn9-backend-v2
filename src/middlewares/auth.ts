import { Request, Response, NextFunction } from 'express';

export function auth(req: Request, res: Response, next: NextFunction) {
  const code = req.header('x-admin-code');
  if (!code || code !== process.env.SUPER_ADMIN_CODE) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
