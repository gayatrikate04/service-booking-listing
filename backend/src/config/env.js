// src/config/env.js
// Load and validate environment variables at startup.
// If a required variable is missing, crash immediately with a clear message.
// This prevents mysterious runtime failures 20 minutes into the server running.

// src/config/env.js
// No changes to structure — just ensure NODE_ENV is handled correctly.
// The existing validation already covers all variables we need.

import dotenv from 'dotenv';

// In production (Railway), environment variables are injected directly.
// dotenv.config() does nothing in that case (no .env file on server).
// In development, it reads from .env file. Both cases handled correctly.
dotenv.config();

const REQUIRED_VARS = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS',
  'JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_SECRET', 'NODE_ENV',
  'CORS_ORIGIN' // Required in production — must be your Vercel URL
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
  nodeEnv: process.env.NODE_ENV,
  port:    parseInt(process.env.PORT || '3001', 10),
  db: {
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10),
    name:     process.env.DB_NAME,
    user:     process.env.DB_USER,
    pass:     process.env.DB_PASS,
    poolMin:  parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax:  parseInt(process.env.DB_POOL_MAX || '10', 10),
    ssl:      process.env.DB_SSL === 'true', // PlanetScale requires SSL
  },
  jwt: {
    secret:         process.env.JWT_SECRET,
    expiresIn:      process.env.JWT_EXPIRES_IN,
    refreshSecret:  process.env.JWT_REFRESH_SECRET,
    refreshExpires: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    // In production this will be: https://your-app.vercel.app
    // Supports comma-separated multiple origins: "https://a.vercel.app,https://custom.com"
    origin: process.env.CORS_ORIGIN,
  },
};