// src/modules/bookings/booking.repository.js
// Pure data access. Accepts a connection parameter for transaction support.
// When connection is provided, uses it (participates in transaction).
// When null, gets a connection from the pool (standalone query).

import { pool } from '../../config/db.js';

async function findSlotForUpdate(slotId, providerId, conn) {
  const db = conn || pool;
  const [rows] = await db.query(
    `SELECT id, provider_id, slot_date, start_time, end_time, status
     FROM time_slots
     WHERE id = ? AND provider_id = ? AND status = 'available'
     FOR UPDATE`,
    [slotId, providerId]
  );
  return rows[0] || null;
}

async function findProviderServiceForShare(serviceId, providerId, conn) {
  const db = conn || pool;
  const [rows] = await db.query(
    `SELECT ps.id, ps.price_per_hour, ps.price_unit, ps.min_booking_hours,
            sc.name AS service_name
     FROM provider_services ps
     JOIN service_categories sc ON ps.service_category_id = sc.id
     WHERE ps.id = ? AND ps.provider_id = ? AND ps.is_active = 1
     FOR SHARE`,
    [serviceId, providerId]
  );
  return rows[0] || null;
}

async function createBooking({
  customerId, providerId, timeSlotId, serviceId,
  priceSnapshot, durationHours, totalAmount, notes
}, conn) {
  const db = conn || pool;
  const [result] = await db.query(
    `INSERT INTO bookings
       (customer_id, provider_id, time_slot_id, service_id,
        status, price_snapshot, duration_hours, total_amount, notes)
     VALUES (?, ?, ?, ?, 'requested', ?, ?, ?, ?)`,
    [customerId, providerId, timeSlotId, serviceId,
     priceSnapshot, durationHours, totalAmount, notes || null]
  );
  return result.insertId;
}

async function markSlotBooked(slotId, conn) {
  const db = conn || pool;
  await db.query(
    `UPDATE time_slots SET status = 'booked' WHERE id = ?`,
    [slotId]
  );
}

async function markSlotAvailable(slotId, conn) {
  const db = conn || pool;
  await db.query(
    `UPDATE time_slots SET status = 'available' WHERE id = ?`,
    [slotId]
  );
}

async function createPaymentRecord(bookingId, amount, conn) {
  const db = conn || pool;
  await db.query(
    `INSERT INTO payments (booking_id, amount, status) VALUES (?, ?, 'pending')`,
    [bookingId, amount]
  );
}

async function insertBookingEvent({ bookingId, fromStatus, toStatus, actorId, actorRole, notes, ipAddress }, conn) {
  const db = conn || pool;
  await db.query(
    `INSERT INTO booking_events
       (booking_id, from_status, to_status, actor_id, actor_role, notes, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [bookingId, fromStatus || null, toStatus, actorId, actorRole, notes || null, ipAddress || null]
  );
}

async function findBookingByIdForUpdate(bookingId, conn) {
  const db = conn || pool;
  const [rows] = await db.query(
    `SELECT b.*, ts.slot_date, ts.start_time, ts.end_time
     FROM bookings b
     JOIN time_slots ts ON b.time_slot_id = ts.id
     WHERE b.id = ?
     FOR UPDATE`,
    [bookingId]
  );
  return rows[0] || null;
}

async function updateBookingStatus({ bookingId, status, cancelledBy, cancelReason }, conn) {
  const db = conn || pool;
  const isCancellation = status === 'cancelled';
  await db.query(
    `UPDATE bookings
     SET status = ?,
         cancelled_by = ?,
         cancel_reason = ?,
         cancelled_at = ${isCancellation ? 'NOW()' : 'NULL'}
     WHERE id = ?`,
    [status, cancelledBy || null, cancelReason || null, bookingId]
  );
}

async function findBookingById(bookingId) {
  const [rows] = await pool.query(
    `SELECT
       b.*,
       u_c.full_name  AS customer_name,
       u_c.phone      AS customer_phone,
       u_p.full_name  AS provider_name,
       u_p.phone      AS provider_phone,
       ts.slot_date, ts.start_time, ts.end_time,
       sc.name        AS service_name,
       pay.status     AS payment_status,
       pay.amount     AS payment_amount
     FROM bookings b
     JOIN users u_c ON b.customer_id = u_c.id
     JOIN users u_p ON b.provider_id = u_p.id
     JOIN time_slots ts ON b.time_slot_id = ts.id
     JOIN provider_services ps ON b.service_id = ps.id
     JOIN service_categories sc ON ps.service_category_id = sc.id
     LEFT JOIN payments pay ON b.id = pay.booking_id
     WHERE b.id = ?`,
    [bookingId]
  );
  return rows[0] || null;
}

async function findBookingsByCustomer(customerId, { page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT
       b.id, b.status, b.total_amount, b.created_at,
       u_p.full_name AS provider_name,
       ts.slot_date, ts.start_time,
       sc.name AS service_name
     FROM bookings b
     JOIN users u_p ON b.provider_id = u_p.id
     JOIN time_slots ts ON b.time_slot_id = ts.id
     JOIN provider_services ps ON b.service_id = ps.id
     JOIN service_categories sc ON ps.service_category_id = sc.id
     WHERE b.customer_id = ?
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [customerId, pageSize, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM bookings WHERE customer_id = ?`,
    [customerId]
  );
  return { bookings: rows, total };
}

async function findBookingsByProvider(providerId, { status, page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const conditions = ['b.provider_id = ?'];
  const params = [providerId];

  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }

  const whereClause = conditions.join(' AND ');

  const [rows] = await pool.query(
    `SELECT
       b.id, b.status, b.total_amount, b.created_at,
       u_c.full_name AS customer_name,
       u_c.phone AS customer_phone,
       ts.slot_date, ts.start_time,
       sc.name AS service_name
     FROM bookings b
     JOIN users u_c ON b.customer_id = u_c.id
     JOIN time_slots ts ON b.time_slot_id = ts.id
     JOIN provider_services ps ON b.service_id = ps.id
     JOIN service_categories sc ON ps.service_category_id = sc.id
     WHERE ${whereClause}
     ORDER BY ts.slot_date ASC, ts.start_time ASC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM bookings b WHERE ${whereClause}`,
    params
  );

  return { bookings: rows, total };
}

async function findBookingEvents(bookingId) {
  const [rows] = await pool.query(
    `SELECT be.*, u.full_name AS actor_name
     FROM booking_events be
     JOIN users u ON be.actor_id = u.id
     WHERE be.booking_id = ?
     ORDER BY be.created_at ASC`,
    [bookingId]
  );
  return rows;
}

export const bookingRepository = {
  findSlotForUpdate,
  findProviderServiceForShare,
  createBooking,
  markSlotBooked,
  markSlotAvailable,
  createPaymentRecord,
  insertBookingEvent,
  findBookingByIdForUpdate,
  updateBookingStatus,
  findBookingById,
  findBookingsByCustomer,
  findBookingsByProvider,
  findBookingEvents,
};