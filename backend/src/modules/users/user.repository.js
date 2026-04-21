// src/modules/users/user.repository.js

import { pool } from '../../config/db.js';

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, phone, full_name, role, city,
            profile_pic, is_active, is_verified, last_login_at, created_at
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, email, phone, full_name, role, city,
            is_active, is_verified, created_at
     FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

// Separate method that includes password_hash — only used by auth.service login
async function findByEmailWithPassword(email) {
  const [rows] = await pool.query(
    `SELECT id, email, phone, full_name, role, city,
            password_hash, is_active, is_verified
     FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function findByPhone(phone) {
  const [rows] = await pool.query(
    `SELECT id FROM users WHERE phone = ?`,
    [phone]
  );
  return rows[0] || null;
}

async function create({ email, phone, password_hash, full_name, role, city }) {
  const [result] = await pool.query(
    `INSERT INTO users (email, phone, password_hash, full_name, role, city)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, phone, password_hash, full_name, role, city]
  );
  return result.insertId;
}

async function createProviderProfile(userId) {
  await pool.query(
    `INSERT INTO provider_profiles (user_id) VALUES (?)`,
    [userId]
  );
}

async function updateLastLogin(userId) {
  await pool.query(
    `UPDATE users SET last_login_at = NOW() WHERE id = ?`,
    [userId]
  );
}

async function updateProfile(userId, { full_name, city, profile_pic }) {
  const fields = [];
  const values = [];

  if (full_name !== undefined)  { fields.push('full_name = ?');  values.push(full_name); }
  if (city !== undefined)       { fields.push('city = ?');       values.push(city); }
  if (profile_pic !== undefined){ fields.push('profile_pic = ?');values.push(profile_pic); }

  if (fields.length === 0) return;

  values.push(userId);
  await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

async function updatePassword(userId, password_hash) {
  await pool.query(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [password_hash, userId]
  );
}

// Admin: list users with optional role filter and pagination
async function findAll({ role, city, isActive, page, pageSize }) {
  const offset     = (page - 1) * pageSize;
  const conditions = [];
  const params     = [];

  if (role)     { conditions.push('role = ?');      params.push(role); }
  if (city)     { conditions.push('city = ?');      params.push(city); }
  if (isActive !== undefined) {
    conditions.push('is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT id, email, phone, full_name, role, city,
            is_active, is_verified, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM users ${where}`,
    params
  );

  return { users: rows, total };
}

async function setActiveStatus(userId, isActive) {
  await pool.query(
    `UPDATE users SET is_active = ? WHERE id = ?`,
    [isActive ? 1 : 0, userId]
  );
}

async function setVerifiedStatus(userId, isVerified) {
  await pool.query(
    `UPDATE users SET is_verified = ? WHERE id = ?`,
    [isVerified ? 1 : 0, userId]
  );
}

export const userRepository = {
  findById,
  findByEmail,
  findByEmailWithPassword,
  findByPhone,
  create,
  createProviderProfile,
  updateLastLogin,
  updateProfile,
  updatePassword,
  findAll,
  setActiveStatus,
  setVerifiedStatus,
};