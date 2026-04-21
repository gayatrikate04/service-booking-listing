// src/server.js
// HTTP server setup with graceful shutdown.
// Graceful shutdown: stop accepting new requests, wait for in-flight requests
// to complete, then close DB pool and exit.
// Without this, Docker/Kubernetes restarts kill active transactions mid-flight.

// import { createApp } from './app.js';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { testConnection, pool } from './config/db.js';

async function startServer() {
  try{
  // Validate DB connection before starting HTTP server.
  // Fail fast: a running server that can't reach the DB is worse than not starting.
  await testConnection();

  const app    = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`[SERVER] Running on port ${env.port} in ${env.nodeEnv} mode`);
  });

  // Graceful shutdown handler
  async function shutdown(signal) {
    logger.info(`[SERVER] ${signal} received, starting graceful shutdown`);

    // Stop accepting new HTTP connections
    server.close(async () => {
      logger.info('[SERVER] HTTP server closed');

      // Close database pool — waits for active queries to complete
      try {
        await pool.end();
        logger.info('[DB] Connection pool closed');
      } catch (err) {
        logger.error('[DB] Error closing pool', { error: err.message });
      }

      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long (e.g., stuck transaction)
    setTimeout(() => {
      logger.error('[SERVER] Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 15000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker/Kubernetes sends this
  process.on('SIGINT',  () => shutdown('SIGINT'));  // Ctrl+C in development

  // Catch unhandled promise rejections — log and exit
  // An unhandled rejection means the app is in an unknown state
  process.on('unhandledRejection', (reason) => {
    logger.error('[PROCESS] Unhandled rejection', { reason });
    server.close(() => process.exit(1));
  });

  // Catch uncaught synchronous exceptions
  process.on('uncaughtException', (err) => {
    logger.error('[PROCESS] Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
  } catch (err) {
    logger.error('[SERVER] Failed to start server', { 
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
}

startServer();