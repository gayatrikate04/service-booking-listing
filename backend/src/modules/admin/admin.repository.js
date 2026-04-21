// src/modules/admin/admin.repository.js


import { pool } from '../../config/db.js';

async function getPlatformStats() {
  const [[users]]    = await pool.query(`SELECT COUNT(*) as total FROM users WHERE is_active = 1`);
  const [[providers]]= await pool.query(`SELECT COUNT(*) as total FROM users WHERE role = 'provider' AND is_active = 1`);
  const [[bookings]] = await pool.query(`SELECT COUNT(*) as total FROM bookings`);
  const [[revenue]]  = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE status = 'completed'`
  );
  const [[pending]]  = await pool.query(
    `SELECT COUNT(*) as total FROM bookings WHERE status = 'requested'`
  );
  const [[reviews]]  = await pool.query(
    `SELECT COUNT(*) as total FROM reviews WHERE is_flagged = 1`
  );

  return {
    total_users:           users.total,
    total_active_providers: providers.total,
    total_bookings:        bookings.total,
    total_revenue:         parseFloat(revenue.total),
    pending_bookings:      pending.total,
    flagged_reviews:       reviews.total,
  };
}

async function findAllBookings({ status, page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const params     = [];

  if (status) { conditions.push('b.status = ?'); params.push(status); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
       b.id, b.status, b.total_amount, b.created_at,
       u_c.full_name AS customer_name,
       u_p.full_name AS provider_name,
       sc.name AS service_name,
       ts.slot_date
     FROM bookings b
     JOIN users u_c ON b.customer_id = u_c.id
     JOIN users u_p ON b.provider_id = u_p.id
     JOIN time_slots ts ON b.time_slot_id = ts.id
     JOIN provider_services ps ON b.service_id = ps.id
     JOIN service_categories sc ON ps.service_category_id = sc.id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM bookings b ${where}`, params
  );

  return { bookings: rows, total };
}

export const adminRepository = { getPlatformStats, findAllBookings };