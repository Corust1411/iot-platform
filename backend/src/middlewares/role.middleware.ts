import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { pool } from '../config/db';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const query = 'SELECT role FROM account WHERE id = $1';
    const result = await pool.query(query, [accountId]);

    if (result.rowCount === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    next();
  } catch (error) {
    console.error('Role Check Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};