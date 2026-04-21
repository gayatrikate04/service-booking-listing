// src/jobs/cleanupJob.js
// Archives old booking_events to keep the live table lean.
// Also cleans up unbooked past slots to prevent table bloat.
// Run weekly via cron.

import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';

const EVENTS_RETENTION_DAYS = 365;   // Keep 1 year of events in live table
const PAST_SLOTS_RETENTION_DAYS = 7; // Keep 7 days of past available slots

async function archiveOldBookingEvents() {
  logger.info('[CLEANUP] Starting booking_events archival');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - EVENTS_RETENTION_DAYS);
  const cutoffStr = cutoffDate.toISOString().slice(0, 19).replace('T', ' ');

  let totalArchived = 0;
  const BATCH_SIZE  = 1000;

  while (true) {
    // Ensure archive table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_events_archive LIKE booking_events
    `);

    // Move in batches — never run a massive DELETE on a live table
    const [result] = await pool.query(`
      INSERT IGNORE INTO booking_events_archive
        SELECT * FROM booking_events
        WHERE created_at < ? LIMIT ?
    `, [cutoffStr, BATCH_SIZE]);

    if (result.affectedRows === 0) break;

    const [del] = await pool.query(`
      DELETE FROM booking_events
      WHERE created_at < ?
      LIMIT ?
    `, [cutoffStr, BATCH_SIZE]);

    totalArchived += del.affectedRows;

    logger.debug('[CLEANUP] Archived batch', { count: del.affectedRows });

    // Pause between batches to let other queries breathe
    await new Promise(r => setTimeout(r, 100));
  }

  logger.info('[CLEANUP] Archival complete', { totalArchived });
  return totalArchived;
}

async function cleanPastUnbookedSlots() {
  logger.info('[CLEANUP] Removing old unbooked slots');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - PAST_SLOTS_RETENTION_DAYS);
  const cutoff = cutoffDate.toISOString().slice(0, 10);

  const [result] = await pool.query(`
    DELETE FROM time_slots
    WHERE slot_date < ?
      AND status = 'available'
    LIMIT 5000
  `, [cutoff]);

  logger.info('[CLEANUP] Cleaned past slots', { deleted: result.affectedRows });
  return result.affectedRows;
}

async function runCleanup() {
  logger.info('[CLEANUP] Starting cleanup job');
  try {
    const archived = await archiveOldBookingEvents();
    const cleaned  = await cleanPastUnbookedSlots();
    logger.info('[CLEANUP] Job complete', { archived, cleaned });
  } catch (err) {
    logger.error('[CLEANUP] Job failed', { error: err.message, stack: err.stack });
    throw err;
  }
}

export { runCleanup, archiveOldBookingEvents, cleanPastUnbookedSlots };

if (process.argv[1].endsWith('cleanupJob.js')) {
  runCleanup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}