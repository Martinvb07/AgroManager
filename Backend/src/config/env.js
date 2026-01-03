import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'agromanager',
  DB_POOL_LIMIT: process.env.DB_POOL_LIMIT ? Number(process.env.DB_POOL_LIMIT) : 10,
};
