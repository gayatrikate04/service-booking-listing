// src/modules/services/category.repository.js

import { pool } from '../../config/db.js';

async function findAll({ includeInactive = false } = {}) {
  const where = includeInactive ? '' : 'WHERE is_active = 1';
  const [rows] = await pool.query(
    `SELECT id, name, slug, description, icon_url, base_price, display_order
     FROM service_categories ${where}
     ORDER BY display_order ASC, name ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM service_categories WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT * FROM service_categories WHERE slug = ?`,
    [slug]
  );
  return rows[0] || null;
}

async function create({ name, slug, description, icon_url, base_price, display_order }) {
  const [result] = await pool.query(
    `INSERT INTO service_categories
       (name, slug, description, icon_url, base_price, display_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, slug, description || null, icon_url || null,
     base_price || null, display_order || 0]
  );
  return result.insertId;
}

async function update(id, fields) {
  const allowed = ['name', 'slug', 'description', 'icon_url', 'base_price',
                   'display_order', 'is_active'];
  const setClauses = [];
  const values     = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) return;
  values.push(id);

  await pool.query(
    `UPDATE service_categories SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
}

// Find providers offering a specific category — used in provider search
async function findProvidersByCategory(categoryId, { city, minRating, page, pageSize }) {
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `SELECT
       u.id, u.full_name, u.city,
       pp.avg_rating, pp.years_exp, pp.is_verified, pp.total_bookings,
       ps.price_per_hour, ps.price_unit, ps.id AS service_listing_id
     FROM users u
     JOIN provider_profiles pp ON u.id = pp.user_id
     JOIN provider_services ps ON u.id = ps.provider_id
     WHERE u.role = 'provider'
       AND u.is_active = 1
       AND u.city = ?
       AND ps.service_category_id = ?
       AND ps.is_active = 1
       AND pp.avg_rating >= ?
     ORDER BY pp.avg_rating DESC, pp.total_bookings DESC
     LIMIT ? OFFSET ?`,
    [city, categoryId, minRating || 0, pageSize, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total
     FROM users u
     JOIN provider_profiles pp ON u.id = pp.user_id
     JOIN provider_services ps ON u.id = ps.provider_id
     WHERE u.role = 'provider'
       AND u.is_active = 1
       AND u.city = ?
       AND ps.service_category_id = ?
       AND ps.is_active = 1
       AND pp.avg_rating >= ?`,
    [city, categoryId, minRating || 0]
  );

  return { providers: rows, total };
}

export const categoryRepository = {
  findAll, findById, findBySlug, create, update, findProvidersByCategory
};