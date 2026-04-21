// src/modules/bookings/booking.constants.js
// State machine defined as data, not scattered if/else chains.
// Adding a new state or transition means editing this file only.

export const BOOKING_STATUS = {
  REQUESTED:   'requested',
  CONFIRMED:   'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
  REJECTED:    'rejected',
};

// Defines which transitions are valid from each state
export const VALID_TRANSITIONS = {
  [BOOKING_STATUS.REQUESTED]:   [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]:   [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED],
  [BOOKING_STATUS.COMPLETED]:   [],
  [BOOKING_STATUS.CANCELLED]:   [],
  [BOOKING_STATUS.REJECTED]:    [],
};

// Defines which roles can trigger each transition
// Key format: "fromStatus_toStatus"
export const TRANSITION_ACTOR_RULES = {
  [`${BOOKING_STATUS.REQUESTED}_${BOOKING_STATUS.CONFIRMED}`]:   ['provider'],
  [`${BOOKING_STATUS.REQUESTED}_${BOOKING_STATUS.REJECTED}`]:    ['provider'],
  [`${BOOKING_STATUS.REQUESTED}_${BOOKING_STATUS.CANCELLED}`]:   ['customer', 'admin'],
  [`${BOOKING_STATUS.CONFIRMED}_${BOOKING_STATUS.IN_PROGRESS}`]: ['provider'],
  [`${BOOKING_STATUS.CONFIRMED}_${BOOKING_STATUS.CANCELLED}`]:   ['customer', 'provider', 'admin'],
  [`${BOOKING_STATUS.IN_PROGRESS}_${BOOKING_STATUS.COMPLETED}`]: ['provider'],
};

export const TERMINAL_STATUSES = new Set([
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.REJECTED,
]);