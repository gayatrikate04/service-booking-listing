// src/modules/bookings/booking.service.js
// This is the most critical file in the entire backend.
// All transaction logic, state machine enforcement, and booking business
// rules live here. Read every comment.

import { withTransaction } from '../../config/db.js';
import { bookingRepository } from './booking.repository.js';
import { AppError } from '../../utils/AppError.js';
import { logger } from '../../config/logger.js';
import {
  VALID_TRANSITIONS,
  TRANSITION_ACTOR_RULES,
  TERMINAL_STATUSES,
  BOOKING_STATUS,
} from './booking.constants.js';
import { getPaginationParams } from '../../utils/pagination.js';

// ─── STATE MACHINE VALIDATOR ────────────────────────────────────────────────
// Centralized transition validation. Called before every status update.
// Throws AppError on invalid transition or unauthorized actor.
function validateTransition(currentStatus, targetStatus, actorRole) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(targetStatus)) {
    throw new AppError(
      'INVALID_TRANSITION',
      `Cannot transition booking from '${currentStatus}' to '${targetStatus}'`,
      422
    );
  }

  const ruleKey = `${currentStatus}_${targetStatus}`;
  const allowedActors = TRANSITION_ACTOR_RULES[ruleKey] || [];

  if (!allowedActors.includes(actorRole)) {
    throw new AppError(
      'UNAUTHORIZED_TRANSITION',
      `Role '${actorRole}' is not permitted to perform this status change`,
      403
    );
  }
}

// ─── CREATE BOOKING ──────────────────────────────────────────────────────────
async function createBooking({ customerId, providerId, timeSlotId, serviceId, notes }, actorIp) {
  // withTransaction handles: BEGIN, COMMIT, ROLLBACK, connection release,
  // and deadlock retry with exponential backoff (up to 3 attempts).
  const result = await withTransaction(async (conn) => {

    // ── STEP 1: Lock the time slot with FOR UPDATE ───────────────────────────
    // This acquires an exclusive row lock on this specific time_slot row.
    // Any concurrent transaction trying to lock the same row will BLOCK
    // until our transaction commits or rolls back.
    // We also verify: slot exists, belongs to this provider, and is available.
    const slot = await bookingRepository.findSlotForUpdate(timeSlotId, providerId, conn);

    if (!slot) {
      // Throw inside withTransaction — triggers automatic rollback
      throw new AppError(
        'SLOT_UNAVAILABLE',
        'This time slot is not available for booking',
        409
      );
    }

    // ── STEP 2: Verify the service and lock its price ────────────────────────
    // FOR SHARE: we don't modify this row, but we need price consistency.
    // Prevents the provider from changing their price mid-transaction.
    const service = await bookingRepository.findProviderServiceForShare(serviceId, providerId, conn);

    if (!service) {
      throw new AppError(
        'SERVICE_NOT_FOUND',
        'The requested service is not offered by this provider',
        404
      );
    }

    // ── STEP 3: Calculate booking financials ─────────────────────────────────
    const startMinutes = timeToMinutes(slot.start_time);
    const endMinutes   = timeToMinutes(slot.end_time);
    const durationHours = (endMinutes - startMinutes) / 60;

    if (durationHours < service.min_booking_hours) {
      throw new AppError(
        'DURATION_TOO_SHORT',
        `Minimum booking duration for this service is ${service.min_booking_hours} hour(s)`,
        422
      );
    }

    // price_snapshot: locks in the price at booking time.
    // Even if the provider changes price later, this booking reflects
    // what the customer agreed to pay. Like a receipt.
    const priceSnapshot = parseFloat(service.price_per_hour);
    const totalAmount   = parseFloat((priceSnapshot * durationHours).toFixed(2));

    // ── STEP 4: Create the booking record ────────────────────────────────────
    // If the UNIQUE(time_slot_id) constraint fires here (race condition slipped
    // through the FOR UPDATE), MySQL throws errno 1062. The withTransaction
    // catch block rolls back and dbErrors.js translates it to SLOT_UNAVAILABLE.
    const bookingId = await bookingRepository.createBooking({
      customerId,
      providerId,
      timeSlotId,
      serviceId,
      priceSnapshot,
      durationHours,
      totalAmount,
      notes,
    }, conn);

    // ── STEP 5: Mark the slot as booked ──────────────────────────────────────
    await bookingRepository.markSlotBooked(timeSlotId, conn);

    // ── STEP 6: Write the initial audit event ────────────────────────────────
    await bookingRepository.insertBookingEvent({
      bookingId,
      fromStatus: null,
      toStatus:   BOOKING_STATUS.REQUESTED,
      actorId:    customerId,
      actorRole:  'customer',
      notes:      'Booking created',
      ipAddress:  actorIp,
    }, conn);

    // ── STEP 7: Create the payment record ────────────────────────────────────
    // Payment starts as 'pending'. This record exists from the moment of booking.
    await bookingRepository.createPaymentRecord(bookingId, totalAmount, conn);

    // All 4 operations succeed → conn.commit() happens in withTransaction
    logger.info('[BOOKING] Booking created successfully', {
      bookingId, customerId, providerId, timeSlotId, totalAmount
    });

    return { bookingId, totalAmount, serviceName: service.service_name };
  });

  return result;
}

// ─── UPDATE BOOKING STATUS ───────────────────────────────────────────────────
async function updateBookingStatus({ bookingId, targetStatus, actorId, actorRole, cancelReason, ipAddress }) {
  const result = await withTransaction(async (conn) => {

    // Lock the booking row to prevent concurrent status changes
    const booking = await bookingRepository.findBookingByIdForUpdate(bookingId, conn);

    if (!booking) {
      throw AppError.notFound('Booking');
    }

    // Ownership check: customers can only modify their own bookings,
    // providers can only modify bookings assigned to them.
    // Admins can modify any booking.
    if (actorRole === 'customer' && booking.customer_id !== actorId) {
      throw AppError.forbidden('You do not have access to this booking');
    }
    if (actorRole === 'provider' && booking.provider_id !== actorId) {
      throw AppError.forbidden('You do not have access to this booking');
    }

    // State machine validation: is this transition valid? Is this actor allowed?
    validateTransition(booking.status, targetStatus, actorRole);

    const isCancellation = targetStatus === BOOKING_STATUS.CANCELLED;
    const isRejection    = targetStatus === BOOKING_STATUS.REJECTED;

    // ── Update booking status ─────────────────────────────────────────────────
    await bookingRepository.updateBookingStatus({
      bookingId,
      status:       targetStatus,
      cancelledBy:  (isCancellation || isRejection) ? actorId : null,
      cancelReason: (isCancellation || isRejection) ? cancelReason : null,
    }, conn);

    // ── Release the slot if booking is terminated ─────────────────────────────
    // When a booking is cancelled or rejected, the time slot must return to
    // 'available' so other customers can book it.
    if (isCancellation || isRejection) {
      await bookingRepository.markSlotAvailable(booking.time_slot_id, conn);
    }

    // ── Append audit event ────────────────────────────────────────────────────
    await bookingRepository.insertBookingEvent({
      bookingId,
      fromStatus: booking.status,
      toStatus:   targetStatus,
      actorId,
      actorRole,
      notes:      cancelReason || null,
      ipAddress,
    }, conn);

    logger.info('[BOOKING] Status updated', {
      bookingId,
      from: booking.status,
      to:   targetStatus,
      actorId,
      actorRole,
    });

    return { bookingId, from: booking.status, to: targetStatus };
  });

  return result;
}

// ─── GET BOOKING DETAIL ───────────────────────────────────────────────────────
async function getBookingById(bookingId, requestingUser) {
  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) throw AppError.notFound('Booking');

  // Access control: users can only see their own bookings
  if (requestingUser.role === 'customer' && booking.customer_id !== requestingUser.id) {
    throw AppError.forbidden();
  }
  if (requestingUser.role === 'provider' && booking.provider_id !== requestingUser.id) {
    throw AppError.forbidden();
  }

  const events = await bookingRepository.findBookingEvents(bookingId);
  return { ...booking, events };
}

async function getCustomerBookings(customerId, query) {
  const { page, pageSize } = getPaginationParams(query);
  const { bookings, total } = await bookingRepository.findBookingsByCustomer(customerId, { page, pageSize });
  return { bookings, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getProviderBookings(providerId, query) {
  const { page, pageSize } = getPaginationParams(query);
  const { status } = query;
  const { bookings, total } = await bookingRepository.findBookingsByProvider(providerId, { status, page, pageSize });
  return { bookings, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

// Helper: convert "HH:MM:SS" to total minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export const bookingService = {
  createBooking,
  updateBookingStatus,
  getBookingById,
  getCustomerBookings,
  getProviderBookings,
};