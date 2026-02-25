import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (username: string, password: string) => {
  const result = await pool.query(
    'SELECT * FROM account WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  return { token, user };
};

export const register = async (data: any) => {
  const { username, email, password, first_name, last_name, role } = data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO account (username, email, password, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [username, email, hashedPassword, first_name, last_name, role]
  );

  return result.rows[0];
};