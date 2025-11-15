import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  // DB_URL: process.env.DB_URL || '', // Configurar cuando se use base de datos
};
