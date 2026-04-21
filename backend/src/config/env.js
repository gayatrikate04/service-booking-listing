// src/config/env.js
// Load and validate environment variables at startup.
// If a required variable is missing, crash immediately with a clear message.
// This prevents mysterious runtime failures 20 minutes into the server running.

import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_VARS = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS',
  'JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_SECRET', 'NODE_ENV'
];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL] JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

export const env = {
  nodeEnv:          process.env.NODE_ENV,
  port:             parseInt(process.env.PORT || '3001', 10),
  db: {
    host:           process.env.DB_HOST,
    port:           parseInt(process.env.DB_PORT, 10),
    name:           process.env.DB_NAME,
    user:           process.env.DB_USER,
    pass:           process.env.DB_PASS,
    poolMin:        parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax:        parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  jwt: {
    secret:         process.env.JWT_SECRET,
    expiresIn:      process.env.JWT_EXPIRES_IN,
    refreshSecret:  process.env.JWT_REFRESH_SECRET,
    refreshExpires: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin:         process.env.CORS_ORIGIN || 'http://localhost:3000',
  }
};

