import { pool } from '../config/db';

export const createDashboard = async (accountId: number, name: string, description: string) => {
  const query = `
    INSERT INTO dashboard (account_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [accountId, name, description]);
  return result.rows[0];
};

export const getDashboardsByAccountId = async (accountId: number) => {
  const query = `
    SELECT id, name, description, created_at
    FROM dashboard
    WHERE account_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [accountId]);
  return result.rows;
};

export const updateDashboard = async (accountId: number, dashboardId: number, name: string, description: string) => {
  const query = `
    UPDATE dashboard
    SET name = $1, description = $2
    WHERE id = $3 AND account_id = $4
    RETURNING *;
  `;
  const result = await pool.query(query, [name, description, dashboardId, accountId]);
  if (result.rowCount === 0) throw new Error('Dashboard not found or unauthorized');
  return result.rows[0];
};

export const deleteDashboard = async (accountId: number, dashboardId: number) => {
  const query = `
    DELETE FROM dashboard
    WHERE id = $1 AND account_id = $2
    RETURNING id;
  `;
  const result = await pool.query(query, [dashboardId, accountId]);
  if (result.rowCount === 0) throw new Error('Dashboard not found or unauthorized');
  return result.rows[0];
};