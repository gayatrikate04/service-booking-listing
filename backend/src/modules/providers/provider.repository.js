// src/modules/providers/provider.repository.js

import { pool } from '../../config/db.js';

async function findProfileByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT
       u.id, u.full_name, u.email, u.phone, u.city, u.profile_pic,
       u.is_active, u.is_verified AS account_verified, u.created_at,
       pp.bio, pp.years_exp, pp.avg_rating, pp.total_reviews,
       pp.total_bookings, pp.is_verified AS badge_verified, pp.service_radius_km
     FROM users u
     JOIN provider_profiles pp ON u.id = pp.user_id
     WHERE u.id = ? AND u.role = 'provider'`,
    [userId]
  );
  return rows[0] || null;
}

async function findServicesByProvider(providerId) {
  const [rows] = await pool.query(
    `SELECT
       ps.id, ps.price_per_hour, ps.price_unit, ps.min_booking_hours,
       ps.description, ps.is_active,
       sc.id AS category_id, sc.name AS category_name, sc.slug AS category_slug
     FROM provider_services ps
     JOIN service_categories sc ON ps.service_category_id = sc.id
     WHERE ps.provider_id = ?
     ORDER BY sc.name ASC`,
    [providerId]
  );
  return rows;
}

async function upsertService({ providerId, serviceCategoryId, pricePerHour, priceUnit, minBookingHours, description }) {
  // INSERT ... ON DUPLICATE KEY UPDATE handles both add-new and update-existing
  const [result] = await pool.query(
    `INSERT INTO provider_services
       (provider_id, service_category_id, price_per_hour, price_unit, min_booking_hours, description)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       price_per_hour    = VALUES(price_per_hour),
       price_unit        = VALUES(price_unit),
       min_booking_hours = VALUES(min_booking_hours),
       description       = VALUES(description),
       is_active         = 1`,
    [providerId, serviceCategoryId, pricePerHour,
     priceUnit || 'per_hour', minBookingHours || 1, description || null]
  );
  return result.insertId || result.affectedRows;
}

async function deactivateService(providerId, serviceId) {
  const [result] = await pool.query(
    `UPDATE provider_services SET is_active = 0
     WHERE id = ? AND provider_id = ?`,
    [serviceId, providerId]
  );
  return result.affectedRows > 0;
}

async function updateProviderProfile(userId, { bio, years_exp, service_radius_km }) {
  const fields = [];
  const values = [];

  if (bio !== undefined)              { fields.push('bio = ?');              values.push(bio); }
  if (years_exp !== undefined)        { fields.push('years_exp = ?');        values.push(years_exp); }
  if (service_radius_km !== undefined){ fields.push('service_radius_km = ?');values.push(service_radius_km); }

  if (fields.length === 0) return;
  values.push(userId);

  await pool.query(
    `UPDATE provider_profiles SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
}

// Called inside review transaction to update rolling average
async function updateRating(userId, newRating, conn) {
  const db = conn || pool;
  // Atomic rolling average update — no read-compute-write race condition
  await db.query(
    `UPDATE provider_profiles
     SET avg_rating    = ((avg_rating * total_reviews) + ?) / (total_reviews + 1),
         total_reviews = total_reviews + 1
     WHERE user_id = ?`,
    [newRating, userId]
  );
}

async function incrementBookingCount(userId, conn) {
  const db = conn || pool;
  await db.query(
    `UPDATE provider_profiles SET total_bookings = total_bookings + 1 WHERE user_id = ?`,
    [userId]
  );
}

export const providerRepository = {
  findProfileByUserId,
  findServicesByProvider,
  upsertService,
  deactivateService,
  updateProviderProfile,
  updateRating,
  incrementBookingCount,
};