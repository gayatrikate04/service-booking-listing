// src/jobs/slotGenerator.js
// Generates time_slots from provider availability_templates for upcoming dates.
// Run nightly via cron. Idempotent — safe to run multiple times.
// Uses INSERT IGNORE so re-running doesn't create duplicate slots.

import { pool } from '../config/db.js';
import { availabilityRepository } from '../modules/availability/availability.repository.js';
import { logger } from '../config/logger.js';
import { getUpcomingDates, getDayOfWeek, generateSlotWindows } from '../utils/dateUtils.js';

const DAYS_AHEAD = 30; // Generate slots 30 days into the future

async function generateSlotsForAllProviders() {
  logger.info('[SLOT_GEN] Starting slot generation job', { daysAhead: DAYS_AHEAD });

  const startTime = Date.now();
  let totalGenerated = 0;
  let totalProviders = 0;
  let errors = 0;

  // Fetch all active providers
  const [providers] = await pool.query(
    `SELECT DISTINCT user_id as provider_id
     FROM provider_profiles pp
     JOIN users u ON pp.user_id = u.id
     WHERE u.is_active = 1`
  );

  totalProviders = providers.length;
  logger.info(`[SLOT_GEN] Processing ${totalProviders} active providers`);

  const upcomingDates = getUpcomingDates(DAYS_AHEAD);

  for (const { provider_id } of providers) {
    try {
      const count = await generateSlotsForProvider(provider_id, upcomingDates);
      totalGenerated += count;
    } catch (err) {
      errors++;
      logger.error('[SLOT_GEN] Failed for provider', {
        provider_id,
        error: err.message
      });
      // Continue with other providers — don't abort entire job on one failure
    }
  }

  const duration = Date.now() - startTime;
  logger.info('[SLOT_GEN] Job complete', {
    totalProviders,
    totalGenerated,
    errors,
    durationMs: duration,
  });

  return { totalProviders, totalGenerated, errors };
}

async function generateSlotsForProvider(providerId, dates) {
  const templates = await availabilityRepository.findActiveTemplatesByProvider(providerId);

  if (templates.length === 0) return 0;

  // Build a map of day_of_week => templates for O(1) lookup
  const templatesByDay = new Map();
  for (const tmpl of templates) {
    if (!templatesByDay.has(tmpl.day_of_week)) {
      templatesByDay.set(tmpl.day_of_week, []);
    }
    templatesByDay.get(tmpl.day_of_week).push(tmpl);
  }

  const slotsToInsert = [];

  for (const date of dates) {
    const dayOfWeek = getDayOfWeek(new Date(date + 'T00:00:00'));
    const dayTemplates = templatesByDay.get(dayOfWeek) || [];

    for (const tmpl of dayTemplates) {
      const windows = generateSlotWindows(
        tmpl.start_time,
        tmpl.end_time,
        tmpl.slot_duration_min
      );

      for (const window of windows) {
        slotsToInsert.push({
          provider_id: providerId,
          slot_date:   date,
          start_time:  window.start_time,
          end_time:    window.end_time,
        });
      }
    }
  }

  if (slotsToInsert.length === 0) return 0;

  const inserted = await availabilityRepository.bulkInsertSlots(slotsToInsert);
  return inserted;
}

// For manual trigger via API or direct script execution
export { generateSlotsForAllProviders, generateSlotsForProvider };

// Run directly: node src/jobs/slotGenerator.js
// Useful for initial data population and testing
if (process.argv[1].endsWith('slotGenerator.js')) {
  generateSlotsForAllProviders()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error('[SLOT_GEN] Fatal error', { error: err.message });
      process.exit(1);
    });
}