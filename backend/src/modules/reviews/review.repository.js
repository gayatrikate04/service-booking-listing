// src/modules/reviews/review.repository.js


import { pool } from '../../config/db.js';

async function findReviewByBookingId(bookingId) {
  const [rows] = await pool.query(
    `SELECT * FROM reviews WHERE booking_id = ?`,
    [bookingId]
  );
  return rows[0] || null;
}

async function createReview({ bookingId, reviewerId, providerId, rating, comment }, conn) {
  const db = conn || pool;
  const [result] = await db.query(
    `INSERT INTO reviews (booking_id, reviewer_id, provider_id, rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [bookingId, reviewerId, providerId, rating, comment || null]
  );
  return result.insertId;
}

async function findReviewsByProvider(providerId, { page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT
       r.id, r.rating, r.comment, r.created_at,
       u.full_name AS reviewer_name,
       b.id AS booking_id
     FROM reviews r
     JOIN users u ON r.reviewer_id = u.id
     JOIN bookings b ON r.booking_id = b.id
     WHERE r.provider_id = ? AND r.is_flagged = 0
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [providerId, pageSize, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM reviews WHERE provider_id = ? AND is_flagged = 0`,
    [providerId]
  );
  return { reviews: rows, total };
}

async function findReviewsByCustomer(customerId) {
  const [rows] = await pool.query(
    `SELECT
       r.id, r.rating, r.comment, r.created_at,
       u.full_name AS provider_name,
       b.id AS booking_id
     FROM reviews r
     JOIN users u ON r.provider_id = u.id
     JOIN bookings b ON r.booking_id = b.id
     WHERE r.reviewer_id = ?
     ORDER BY r.created_at DESC`,
    [customerId]
  );
  return rows;
}

async function flagReview(reviewId, reason) {
  await pool.query(
    `UPDATE reviews SET is_flagged = 1, flag_reason = ? WHERE id = ?`,
    [reason, reviewId]
  );
}

async function findFlaggedReviews() {
  const [rows] = await pool.query(
    `SELECT r.*, u.full_name AS reviewer_name
     FROM reviews r
     JOIN users u ON r.reviewer_id = u.id
     WHERE r.is_flagged = 1
     ORDER BY r.created_at DESC`
  );
  return rows;
}

export const reviewRepository = {
  findReviewByBookingId,
  createReview,
  findReviewsByProvider,
  findReviewsByCustomer,
  flagReview,
  findFlaggedReviews,
};