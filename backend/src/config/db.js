// src/config/db.js
// mysql2 connection pool with proper configuration.
// Key decisions explained inline.

// This file creates a MySQL connection pool using mysql2. 
// The pool manages reusable database connections for better performance and prevents connection exhaustion.
//  It also tests the database connection during server startup to fail fast if the database is unavailable. 
// Additionally, it provides a helper function called withTransaction which wraps queries inside a transaction, 
// handles commit/rollback automatically, and retries the transaction if a deadlock occurs. 
// This ensures reliable and safe database operations for critical flows like booking creation.

import mysql from 'mysql2/promise';
import { env } from './env.js';
import { logger } from './logger.js';

// Pool is created once and shared across the entire application.
// Never create a new connection per request — that destroys performance
// and exhausts database connections under any real load.
const pool = mysql.createPool({
  host:               env.db.host,
  port:               env.db.port,
  database:           env.db.name,
  user:               env.db.user,
  password:           env.db.pass,

  // Pool sizing: min keeps warm connections ready, max prevents DB overload.
  // For 10k-50k users: 10 connections handles ~500 concurrent requests
  // because most requests complete in <50ms.
  connectionLimit:    env.db.poolMax,

  // waitForConnections: when pool is full, queue requests instead of failing.
  // This is correct behavior under burst load.
  waitForConnections: true,

  // queueLimit: 0 = unlimited queue. For production, set a limit (e.g., 100)
  // to reject requests that would wait too long. For now, 0 is acceptable.
  queueLimit:         0,

  // connectTimeout: fail fast if DB is unreachable.
  connectTimeout:     10000,

  // timezone: store all timestamps in UTC. Critical for multi-timezone apps.
  timezone:           '+00:00',

  // charset: must match the database charset exactly.
  charset:            'utf8mb4',

  // enableKeepAlive: sends periodic pings to keep idle connections alive.
  // Without this, idle connections are dropped by the DB server, causing
  // "Cannot enqueue Query after fatal error" errors after inactivity.
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

// Test the connection on startup. Fail fast is better than failing
// silently on the first real request.
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('SELECT 1');
    logger.info('[DB] Connection pool established successfully', {
      host: env.db.host,
      database: env.db.name,
      poolMax: env.db.poolMax,
    });
  } catch (err) {
    logger.error('[DB] Failed to establish connection pool', { error: err.message });
    process.exit(1); // Cannot run without DB. Exit and let the orchestrator restart.
  } finally {
    // ALWAYS release in finally. If connection is acquired and not released,
    // it leaks from the pool permanently until the server restarts.
    if (connection) connection.release();
  }
}

// Helper: execute a function inside a transaction with automatic retry on deadlock.
// This wraps the repetitive begin/commit/rollback/release pattern.
// Usage: await withTransaction(async (conn) => { ... your queries ... })
async function withTransaction(fn, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const connection = await pool.getConnection();

    try {
      // Use READ COMMITTED for booking transactions.
      // Reduces phantom reads that could cause stale slot availability reads
      // and produces fewer gap locks, lowering deadlock probability.
      await connection.query(
        'SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED'
      );
      await connection.beginTransaction();

      const result = await fn(connection);

      await connection.commit();
      return result;

    } catch (err) {
      await connection.rollback();

      const isDeadlock   = err.errno === 1213; // ER_LOCK_DEADLOCK
      const isLockTimeout = err.errno === 1205; // ER_LOCK_WAIT_TIMEOUT

      if ((isDeadlock || isLockTimeout) && attempt < maxRetries) {
        lastError = err;
        logger.warn('[DB] Deadlock detected, retrying transaction', {
          attempt,
          maxRetries,
          errno: err.errno,
        });
        // Exponential backoff: 100ms, 200ms, 300ms
        await new Promise(r => setTimeout(r, attempt * 100));
        continue;
      }

      throw err; // Non-retryable or max retries exceeded

    } finally {
      connection.release();
    }
  }

  throw lastError;
}

export { pool, testConnection, withTransaction };
await testConnection();