// src/modules/bookings/booking.routes.js

import { Router } from 'express';
import { bookingController } from './booking.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createBookingSchema, updateBookingStatusSchema } from './booking.schema.js';

export const bookingRouter = Router();

// All booking routes require authentication
bookingRouter.use(authenticate);

bookingRouter.post(
  '/',
  authorize('customer'),
  validate(createBookingSchema),
  bookingController.create
);

bookingRouter.get(
  '/my',
  authorize('customer'),
  bookingController.getMyBookings
);

bookingRouter.get(
  '/provider-schedule',
  authorize('provider'),
  bookingController.getProviderBookings
);

bookingRouter.get(
  '/:id',
  authorize('customer', 'provider', 'admin'),
  bookingController.getById
);

bookingRouter.patch(
  '/:id/status',
  authorize('customer', 'provider', 'admin'),
  validate(updateBookingStatusSchema),
  bookingController.updateStatus
);