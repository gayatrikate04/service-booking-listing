// src/utils/dbErrors.js
// Maps MySQL-specific error codes to AppError instances.
// This is the translation layer between raw DB errors and clean API errors.
// The controller and service layers should never see raw MySQL error codes.

import { AppError } from './AppError.js';

export function handleDbError(err) {
  switch (err.errno) {
    case 1062: // ER_DUP_ENTRY — unique constraint violation
      if (err.message.includes('uq_bookings_slot')) {
        return AppError.conflict('SLOT_UNAVAILABLE', 'This time slot has just been booked by someone else');
      }
      if (err.message.includes('uq_reviews_booking')) {
        return AppError.conflict('REVIEW_EXISTS', 'You have already reviewed this booking');
      }
      if (err.message.includes('uq_users_email')) {
        return AppError.conflict('EMAIL_TAKEN', 'This email address is already registered');
      }
      if (err.message.includes('uq_users_phone')) {
        return AppError.conflict('PHONE_TAKEN', 'This phone number is already registered');
      }
      return AppError.conflict('DUPLICATE_ENTRY', 'A duplicate record already exists');

    case 1451: // ER_ROW_IS_REFERENCED — FK RESTRICT violation
      return new AppError('REFERENCE_CONSTRAINT', 'Cannot delete: record is referenced by other data', 409);

    case 1452: // ER_NO_REFERENCED_ROW — FK insert violation
      return new AppError('INVALID_REFERENCE', 'Referenced record does not exist', 422);

    case 1213: // ER_LOCK_DEADLOCK
      return new AppError('DEADLOCK', 'Transaction conflict, please retry', 503);

    case 1205: // ER_LOCK_WAIT_TIMEOUT
      return new AppError('LOCK_TIMEOUT', 'Request timed out due to resource contention', 503);

    default:
      return null; // Not a known DB error, let the global handler deal with it
  }
}