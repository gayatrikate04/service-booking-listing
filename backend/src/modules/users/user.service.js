// src/modules/users/user.service.js

import bcrypt from 'bcrypt';
import { userRepository } from './user.repository.js';
import { AppError } from '../../utils/AppError.js';
import { getPaginationParams } from '../../utils/pagination.js';

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw AppError.notFound('User');
  return user;
}

async function updateProfile(userId, updates) {
  const user = await userRepository.findById(userId);
  if (!user) throw AppError.notFound('User');
  await userRepository.updateProfile(userId, updates);
  return userRepository.findById(userId);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  // Need the hash — fetch directly
  const user = await userRepository.findByEmailWithPassword(
    (await userRepository.findById(userId)).email
  );

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    throw new AppError('INVALID_PASSWORD', 'Current password is incorrect', 422);
  }

  if (currentPassword === newPassword) {
    throw new AppError('SAME_PASSWORD', 'New password must differ from current password', 422);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await userRepository.updatePassword(userId, hash);
  return { message: 'Password updated successfully' };
}

async function listUsers(query) {
  const { page, pageSize } = getPaginationParams(query);
  const { role, city, isActive } = query;
  const { users, total } = await userRepository.findAll({
    role,
    city,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    page,
    pageSize,
  });
  return { users, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export const userService = { getProfile, updateProfile, changePassword, listUsers };