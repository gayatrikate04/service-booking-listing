import api from './api';

export const availabilityService = {
  // GET /availability/providers/:id/slots?date=YYYY-MM-DD
  // Returns available time slots for a provider on a specific date
  getSlots: (providerId, date) =>
    api.get(`/availability/providers/${providerId}/slots`, { params: { date } }),

  // POST /availability/templates — provider sets their weekly availability
  addTemplate: (data) =>
    api.post('/availability/templates', data),

  // GET /availability/templates — provider's own templates
  getTemplates: () =>
    api.get('/availability/templates'),

  // PATCH /availability/slots/:id/block
  blockSlot: (slotId) =>
    api.patch(`/availability/slots/${slotId}/block`),
};