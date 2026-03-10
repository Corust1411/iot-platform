import {pool} from '../config/db';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const getAllAccounts = async () => {
  const query = `
    SELECT id, username, email, first_name, last_name, role, created_at 
    FROM account 
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const createAccount = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  
  const query = `
    INSERT INTO account (username, email, password, first_name, last_name, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, email, first_name, last_name, role, created_at;
  `;
  const values = [data.username, data.email, hashedPassword, data.first_name, data.last_name, data.role || 'user'];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateAccount = async (accountId: number, data: any) => {
  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const query = `
      UPDATE account 
      SET username = $1, email = $2, password = $3, first_name = $4, last_name = $5, role = $6
      WHERE id = $7
      RETURNING id, username, email, first_name, last_name, role;
    `;
    const result = await pool.query(query, [data.username, data.email, hashedPassword, data.first_name, data.last_name, data.role, accountId]);
    return result.rows[0];
  } else {
    const query = `
      UPDATE account 
      SET username = $1, email = $2, first_name = $3, last_name = $4, role = $5
      WHERE id = $6
      RETURNING id, username, email, first_name, last_name, role;
    `;
    const result = await pool.query(query, [data.username, data.email, data.first_name, data.last_name, data.role, accountId]);
    return result.rows[0];
  }
};

export const deleteAccount = async (accountId: number) => {
  const query = 'DELETE FROM account WHERE id = $1 RETURNING id';
  const result = await pool.query(query, [accountId]);
  if (result.rowCount === 0) throw new Error('Account not found');
  return result.rows[0];
};