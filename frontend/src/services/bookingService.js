import api from './api';

export const bookingService = {
  // POST /bookings — customer creates a booking
  // Body: { provider_id, time_slot_id, service_id, notes }
  create: (data) =>
    api.post('/bookings', data),

  // GET /bookings/my — customer's own booking history with pagination
  getMyBookings: (params) =>
    api.get('/bookings/my', { params }),

  // GET /bookings/:id — single booking with full events timeline
  getById: (id) =>
    api.get(`/bookings/${id}`),

  // PATCH /bookings/:id/status — confirm / cancel / complete
  // Body: { status, cancel_reason? }
  updateStatus: (id, data) =>
    api.patch(`/bookings/${id}/status`, data),

  // GET /bookings/provider-schedule — provider's incoming bookings
  getProviderBookings: (params) =>
    api.get('/bookings/provider-schedule', { params }),
};