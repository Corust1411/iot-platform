import { pool } from '../config/db';

export const createNewDevice = async (accountId: number, data: any) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const deviceQuery = `
      INSERT INTO device (account_id, protocol, name, description, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, protocol, category;
    `;
    const deviceValues = [
      accountId,
      data.protocol,
      data.name,
      data.description || '',
      data.category
    ];
    const deviceResult = await client.query(deviceQuery, deviceValues);
    const newDevice = deviceResult.rows[0];

    const configQuery = `
      INSERT INTO device_protocol_config (device_id, config)
      VALUES ($1, $2);
    `;

    const configValues = [newDevice.id, data.config || {}];
    await client.query(configQuery, configValues);

    await client.query('COMMIT');
    return newDevice;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release(); 
  }
};

export const getAllDevices = async () => {
  const result = await pool.query(`SELECT * FROM device ORDER BY created_at DESC`);
  return result.rows;
};

export const getDeviceById = async (accountId: number, deviceId: number) => {
  const query = `
    SELECT d.id, d.name, d.category, d.description, d.protocol, c.config
    FROM device d
    LEFT JOIN device_protocol_config c ON d.id = c.device_id
    WHERE d.id = $1 AND d.account_id = $2
  `;
  // important to ensure device belongs to the account for security
  const result = await pool.query(query, [deviceId, accountId]);
  
  if (result.rows.length === 0) {
    throw new Error('Device not found or unauthorized');
  }
  
  return result.rows[0];
};