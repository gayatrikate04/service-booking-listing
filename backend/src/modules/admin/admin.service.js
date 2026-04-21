// src/modules/admin/admin.service.js

import { adminRepository } from './admin.repository.js';
import { userRepository } from '../users/user.repository.js';
import { reviewRepository } from '../reviews/review.repository.js';
import { AppError } from '../../utils/AppError.js';
import { getPaginationParams } from '../../utils/pagination.js';

async function getStats() {
  return adminRepository.getPlatformStats();
}

async function getAllBookings(query) {
  const { page, pageSize } = getPaginationParams(query);
  const { bookings, total } = await adminRepository.findAllBookings({
    status: query.status, page, pageSize
  });
  return { bookings, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function setUserActiveStatus(targetUserId, isActive, adminId) {
  if (targetUserId === adminId) {
    throw new AppError('SELF_DEACTIVATION', 'You cannot deactivate your own account', 422);
  }
  const user = await userRepository.findById(targetUserId);
  if (!user) throw AppError.notFound('User');
  await userRepository.setActiveStatus(targetUserId, isActive);
  return { userId: targetUserId, is_active: isActive };
}

async function verifyProvider(providerId) {
  const user = await userRepository.findById(providerId);
  if (!user || user.role !== 'provider') throw AppError.notFound('Provider');
  await userRepository.setVerifiedStatus(providerId, true);
  return { message: 'Provider verified successfully' };
}

async function getFlaggedReviews() {
  return reviewRepository.findFlaggedReviews();
}

async function flagReview(reviewId, reason) {
  await reviewRepository.flagReview(reviewId, reason || 'Flagged by admin');
  return { message: 'Review flagged successfully' };
}

export const adminService = {
  getStats, getAllBookings, setUserActiveStatus, verifyProvider,
  getFlaggedReviews, flagReview
};