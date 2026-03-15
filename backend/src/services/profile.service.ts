import { pool } from '../config/db';
import bcrypt from 'bcrypt';

export const getProfileById = async (accountId: number) => {
  const query = `SELECT id, username, email, first_name, last_name, role, created_at FROM account WHERE id = $1`;
  const result = await pool.query(query, [accountId]);
  return result.rows[0];
};

export const updateProfile = async (accountId: number, username: string, email: string, firstName: string, lastName: string) => {
  const checkEmailQuery = `SELECT id FROM account WHERE email = $1 AND id != $2`;
  const emailCheck = await pool.query(checkEmailQuery, [email, accountId]);
  if (emailCheck.rowCount && emailCheck.rowCount > 0) throw new Error('Email is already in use by another account');

  const updateQuery = `
    UPDATE account 
    SET username = $1, email = $2, first_name = $3, last_name = $4 
    WHERE id = $5 
    RETURNING id, username, email, first_name, last_name, role, created_at
  `;
  const result = await pool.query(updateQuery, [username, email, firstName, lastName, accountId]);
  return result.rows[0];
};

export const updatePassword = async (accountId: number, currentPw: string, newPw: string) => {
  const userRes = await pool.query(`SELECT password FROM account WHERE id = $1`, [accountId]);
  const user = userRes.rows[0];

  const isValid = await bcrypt.compare(currentPw, user.password);
  if (!isValid) throw new Error('Incorrect current password');

  const hashedNewPassword = await bcrypt.hash(newPw, 10);
  await pool.query(`UPDATE account SET password = $1 WHERE id = $2`, [hashedNewPassword, accountId]);
};