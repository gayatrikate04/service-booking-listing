// src/modules/availability/availability.repository.js

import { pool } from '../../config/db.js';

async function findTemplatesByProvider(providerId) {
  const [rows] = await pool.query(
    `SELECT id, day_of_week, start_time, end_time, slot_duration_min, is_active
     FROM availability_templates
     WHERE provider_id = ?
     ORDER BY day_of_week ASC, start_time ASC`,
    [providerId]
  );
  return rows;
}

async function findActiveTemplatesByProvider(providerId) {
  const [rows] = await pool.query(
    `SELECT id, day_of_week, start_time, end_time, slot_duration_min
     FROM availability_templates
     WHERE provider_id = ? AND is_active = 1
     ORDER BY day_of_week ASC, start_time ASC`,
    [providerId]
  );
  return rows;
}

async function createTemplate({ providerId, dayOfWeek, startTime, endTime, slotDurationMin }) {
  const [result] = await pool.query(
    `INSERT INTO availability_templates
       (provider_id, day_of_week, start_time, end_time, slot_duration_min)
     VALUES (?, ?, ?, ?, ?)`,
    [providerId, dayOfWeek, startTime, endTime, slotDurationMin || 60]
  );
  return result.insertId;
}

async function updateTemplate(templateId, providerId, { startTime, endTime, slotDurationMin, isActive }) {
  const fields = [];
  const values = [];

  if (startTime !== undefined)       { fields.push('start_time = ?');        values.push(startTime); }
  if (endTime !== undefined)         { fields.push('end_time = ?');          values.push(endTime); }
  if (slotDurationMin !== undefined) { fields.push('slot_duration_min = ?'); values.push(slotDurationMin); }
  if (isActive !== undefined)        { fields.push('is_active = ?');         values.push(isActive ? 1 : 0); }

  if (fields.length === 0) return false;
  values.push(templateId, providerId);

  const [result] = await pool.query(
    `UPDATE availability_templates SET ${fields.join(', ')}
     WHERE id = ? AND provider_id = ?`,
    values
  );
  return result.affectedRows > 0;
}

async function deleteTemplate(templateId, providerId) {
  const [result] = await pool.query(
    `DELETE FROM availability_templates WHERE id = ? AND provider_id = ?`,
    [templateId, providerId]
  );
  return result.affectedRows > 0;
}

async function findSlotsByProviderAndDate(providerId, date) {
  const [rows] = await pool.query(
    `SELECT id, start_time, end_time, status
     FROM time_slots
     WHERE provider_id = ? AND slot_date = ?
     ORDER BY start_time ASC`,
    [providerId, date]
  );
  return rows;
}

async function findAvailableSlotsByProviderAndDate(providerId, date) {
  const [rows] = await pool.query(
    `SELECT id, start_time, end_time
     FROM time_slots
     WHERE provider_id = ? AND slot_date = ? AND status = 'available'
     ORDER BY start_time ASC`,
    [providerId, date]
  );
  return rows;
}

// Used by slot generator job
async function bulkInsertSlots(slots) {
  if (slots.length === 0) return 0;
  // INSERT IGNORE: skips rows that violate the UNIQUE(provider_id, slot_date, start_time)
  // constraint. Makes the job idempotent — safe to run multiple times.
  const values = slots.map(s => [s.provider_id, s.slot_date, s.start_time, s.end_time]);
  const [result] = await pool.query(
    `INSERT IGNORE INTO time_slots (provider_id, slot_date, start_time, end_time)
     VALUES ?`,
    [values]
  );
  return result.affectedRows;
}

async function blockSlot(slotId, providerId) {
  const [result] = await pool.query(
    `UPDATE time_slots
     SET status = 'blocked'
     WHERE id = ? AND provider_id = ? AND status = 'available'`,
    [slotId, providerId]
  );
  return result.affectedRows > 0;
}

async function unblockSlot(slotId, providerId) {
  const [result] = await pool.query(
    `UPDATE time_slots
     SET status = 'available'
     WHERE id = ? AND provider_id = ? AND status = 'blocked'`,
    [slotId, providerId]
  );
  return result.affectedRows > 0;
}

export const availabilityRepository = {
  findTemplatesByProvider,
  findActiveTemplatesByProvider,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  findSlotsByProviderAndDate,
  findAvailableSlotsByProviderAndDate,
  bulkInsertSlots,
  blockSlot,
  unblockSlot,
};