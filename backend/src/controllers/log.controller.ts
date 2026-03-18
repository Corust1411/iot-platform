import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT l.id, l.action, l.detail, l.created_at, a.username 
      FROM user_management_log l
      LEFT JOIN account a ON l.account_id = a.id
      ORDER BY l.created_at DESC
      LIMIT 100;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
  }
};