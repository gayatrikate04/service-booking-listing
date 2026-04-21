import api from './api';

// Maps to backend routes: /categories, /providers, /providers/me/*
export const providerService = {
  // GET /categories — all service categories for dropdowns + filter sidebar
  getCategories: () =>
    api.get('/categories'),

  // GET /categories/:id/providers?city=&minRating=&page=&pageSize=
  // This hits your categoryRepository.findProvidersByCategory
  searchByCategory: (categoryId, params) =>
    api.get(`/categories/${categoryId}/providers`, { params }),

  // GET /providers/:id — full profile with services (public)
  getProfile: (providerId) =>
    api.get(`/providers/${providerId}`),

  // PATCH /providers/me/profile — provider updates their own profile
  updateMyProfile: (data) =>
    api.patch('/providers/me/profile', data),

  // POST /providers/me/services — provider adds a new service offering
  addService: (data) =>
    api.post('/providers/me/services', data),

  // DELETE /providers/me/services/:serviceId
  removeService: (serviceId) =>
    api.delete(`/providers/me/services/${serviceId}`),
};