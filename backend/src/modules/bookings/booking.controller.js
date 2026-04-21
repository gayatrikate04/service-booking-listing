// src/modules/bookings/booking.controller.js
// Thin layer. Parses HTTP, calls service, returns response.
// Zero business logic here.

import { bookingService } from './booking.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const create = asyncWrapper(async (req, res) => {
  const { provider_id, time_slot_id, service_id, notes } = req.body;
  const result = await bookingService.createBooking(
    {
      customerId:  req.user.id,
      providerId:  provider_id,
      timeSlotId:  time_slot_id,
      serviceId:   service_id,
      notes,
    },
    req.ip
  );
  res.status(201).json({ success: true, data: result });
});

const updateStatus = asyncWrapper(async (req, res) => {
  const { status, cancel_reason } = req.body;
  const result = await bookingService.updateBookingStatus({
    bookingId:    req.params.id,
    targetStatus: status,
    actorId:      req.user.id,
    actorRole:    req.user.role,
    cancelReason: cancel_reason,
    ipAddress:    req.ip,
  });
  res.status(200).json({ success: true, data: result });
});

const getById = asyncWrapper(async (req, res) => {
  const booking = await bookingService.getBookingById(
    parseInt(req.params.id, 10),
    req.user
  );
  res.status(200).json({ success: true, data: booking });
});

const getMyBookings = asyncWrapper(async (req, res) => {
  const result = await bookingService.getCustomerBookings(req.user.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const getProviderBookings = asyncWrapper(async (req, res) => {
  const result = await bookingService.getProviderBookings(req.user.id, req.query);
  res.status(200).json({ success: true, ...result });
});

export const bookingController = {
  create,
  updateStatus,
  getById,
  getMyBookings,
  getProviderBookings,
};