import mysql from 'mysql2/promise';
import { env } from './env.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: env.DB_POOL_LIMIT,
      queueLimit: 0,
      timezone: 'Z',
    });
  }
  return pool;
}

export async function testConnection() {
  const p = getPool();
  const [rows] = await p.query('SELECT 1 AS ok');
  return rows?.[0]?.ok === 1;
}
