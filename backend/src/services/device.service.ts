import { pool } from '../config/db';

export const createDevice = async (data: any) => {
  const { account_id, protocol, name, description, category } = data;

  const result = await pool.query(
    `INSERT INTO device (account_id, protocol, name, description, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [account_id, protocol, name, description, category]
  );

  return result.rows[0];
};

export const getAllDevices = async () => {
  const result = await pool.query(`SELECT * FROM device ORDER BY created_at DESC`);
  return result.rows;
};