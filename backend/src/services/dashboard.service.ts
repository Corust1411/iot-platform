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

/* for dashboardDetails */
export const getDashboardById = async (accountId: number, dashboardId: number) => {
  const query = 'SELECT id, name, description FROM dashboard WHERE id = $1 AND account_id = $2';
  const result = await pool.query(query, [dashboardId, accountId]);
  return result.rows[0];
};

export const getDashboardDevices = async (dashboardId: number) => {
  const query = `
    SELECT dd.id as dashboard_device_id, dd.alias, d.id as device_id, d.name as device_name, d.protocol 
    FROM dashboard_device dd
    JOIN device d ON dd.device_id = d.id
    WHERE dd.dashboard_id = $1
    ORDER BY dd.created_at DESC;
  `;
  const result = await pool.query(query, [dashboardId]);
  return result.rows;
};

export const addDeviceToDashboard = async (dashboardId: number, deviceId: number, alias: string) => {
  const query = `
    INSERT INTO dashboard_device (dashboard_id, device_id, alias)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [dashboardId, deviceId, alias || null]);
  return result.rows[0];
};

export const removeDeviceFromDashboard = async (dashboardDeviceId: number) => {
  const query = 'DELETE FROM dashboard_device WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [dashboardDeviceId]);
  return result.rows[0];
};

export const createDashboardWidget = async (dashboardId: number, data: any) => {
  const query = `
    INSERT INTO dashboard_widget (dashboard_id, device_id, title, type, data_key, config)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    dashboardId,
    data.device_id,
    data.title,
    data.type,
    data.data_key,
    data.config || {}
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};