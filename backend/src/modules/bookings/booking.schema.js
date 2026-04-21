// src/modules/bookings/booking.schema.js

import { z } from 'zod';
import { BOOKING_STATUS } from './booking.constants.js';

export const createBookingSchema = z.object({
  body: z.object({
    provider_id:  z.number().int().positive('provider_id must be a positive integer'),
    time_slot_id: z.number().int().positive('time_slot_id must be a positive integer'),
    service_id:   z.number().int().positive('service_id must be a positive integer'),
    notes:        z.string().max(1000).optional().nullable(),
  })
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Booking ID must be numeric').transform(Number),
  }),
  body: z.object({
    status:        z.enum(Object.values(BOOKING_STATUS)),
    cancel_reason: z.string().max(500).optional(),
  }).refine(
    (data) => {
      // cancel_reason is required when cancelling
      if (data.status === BOOKING_STATUS.CANCELLED && !data.cancel_reason) return false;
      return true;
    },
    { message: 'cancel_reason is required when cancelling a booking', path: ['cancel_reason'] }
  )
});