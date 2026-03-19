import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

const getReadableAction = (method: string, url: string): string => {
  const lowerUrl = url.toLowerCase();
  
//   if (lowerUrl.includes('/login') || lowerUrl.includes('/auth')) {
//     return 'Login';
//   }

  let entity = 'System';
  if (lowerUrl.includes('/devices')) entity = 'Device';
  else if (lowerUrl.includes('/accounts')) entity = 'Account';
  else if (lowerUrl.includes('/dashboards')) entity = 'Dashboard';
  else if (lowerUrl.includes('/zigbee')) entity = 'Zigbee Network';

  let actionVerb = 'Access';
  if (method === 'POST') actionVerb = 'Create';
  else if (method === 'PUT' || method === 'PATCH') actionVerb = 'Update';
  else if (method === 'DELETE') actionVerb = 'Delete';

  return `${actionVerb} ${entity}`;
};

export const auditLogger = (req: AuthRequest, res: Response, next: NextFunction) => {
  res.on('finish', async () => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      const accountId = req.user?.id || null;
      const readableAction = getReadableAction(req.method, req.originalUrl);
      const bodyClone = { ...req.body };
      if (bodyClone.password) bodyClone.password = '***';
      const detailObj = {
        target_url: req.originalUrl,
        payload: bodyClone
      };
      const detail = JSON.stringify(detailObj);

      try {
        const query = `
          INSERT INTO user_management_log (account_id, action, detail, created_at)
          VALUES ($1, $2, $3, NOW())
        `;
        await pool.query(query, [accountId, readableAction, detail]);
      } catch (err) {
        console.error('❌ Audit Log Error:', err);
      }
    }
  });
  next();
};