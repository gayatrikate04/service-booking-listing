// src/modules/reviews/review.service.js

import { withTransaction } from '../../config/db.js';
import { reviewRepository } from './review.repository.js';
import { bookingRepository } from '../bookings/booking.repository.js';
import { providerRepository } from '../providers/provider.repository.js';
import { AppError } from '../../utils/AppError.js';
import { getPaginationParams } from '../../utils/pagination.js';
import { BOOKING_STATUS } from '../bookings/booking.constants.js';

async function createReview(customerId, { booking_id, rating, comment }) {
  // Step 1: Verify the booking exists and is completed
  const booking = await bookingRepository.findBookingById(booking_id);

  if (!booking) throw AppError.notFound('Booking');

  if (booking.customer_id !== customerId) {
    throw AppError.forbidden('You can only review your own bookings');
  }

  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw new AppError(
      'BOOKING_NOT_COMPLETED',
      'You can only review a completed booking',
      422
    );
  }

  // Step 2: Check if review already exists (before transaction for fast fail)
  const existing = await reviewRepository.findReviewByBookingId(booking_id);
  if (existing) {
    throw AppError.conflict('REVIEW_EXISTS', 'You have already reviewed this booking');
  }

  // Step 3: Create review and update provider rating atomically
  // If the review INSERT succeeds but the rating UPDATE fails,
  // the provider's avg_rating would be stale. Both must happen together.
  const result = await withTransaction(async (conn) => {
    const reviewId = await reviewRepository.createReview({
      bookingId:  booking_id,
      reviewerId: customerId,
      providerId: booking.provider_id,
      rating,
      comment,
    }, conn);

    // Atomic rolling average update — no race condition possible
    await providerRepository.updateRating(booking.provider_id, rating, conn);

    return { reviewId };
  });

  return result;
}

async function getProviderReviews(providerId, query) {
  const { page, pageSize } = getPaginationParams(query);
  const { reviews, total } = await reviewRepository.findReviewsByProvider(
    providerId, { page, pageSize }
  );
  return { reviews, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getMyReviews(customerId) {
  return reviewRepository.findReviewsByCustomer(customerId);
}

export const reviewService = { createReview, getProviderReviews, getMyReviews };