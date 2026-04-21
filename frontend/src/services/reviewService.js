import api from './api';

export const reviewService = {
  // POST /reviews — customer submits review for a completed booking
  // Body: { booking_id, rating, comment }
  create: (data) =>
    api.post('/reviews', data),

  // GET /reviews/provider/:id — all reviews for a provider (public)
  getByProvider: (providerId, params) =>
    api.get(`/reviews/provider/${providerId}`, { params }),

  // GET /reviews/my — customer's own submitted reviews
  getMyReviews: () =>
    api.get('/reviews/my'),
};