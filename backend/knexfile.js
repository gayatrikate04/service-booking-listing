// knexfile.js
// Knex configuration for database migrations.
// Three environments: development, test, production.

import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client:     'mysql2',
    connection: {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME     || 'booking_platform',
      user:     process.env.DB_USER     || 'appuser',
      password: process.env.DB_PASS     || '',
      charset:  'utf8mb4',
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    pool: { min: 2, max: 10 },
  },

  test: {
    client:     'mysql2',
    connection: {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '3306'),
      database: process.env.TEST_DB_NAME || 'booking_platform_test',
      user:     process.env.DB_USER      || 'appuser',
      password: process.env.DB_PASS      || '',
      charset:  'utf8mb4',
    },
    migrations: { directory: './migrations', tableName: 'knex_migrations' },
    pool: { min: 1, max: 5 },
  },

  production: {
    client:     'mysql2',
    connection: {
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASS,
      charset:  'utf8mb4',
      ssl: { rejectUnauthorized: true },
    },
    migrations: { directory: './migrations', tableName: 'knex_migrations' },
    pool: { min: 2, max: 20 },
  },
};