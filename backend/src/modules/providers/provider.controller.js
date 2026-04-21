// src/modules/providers/provider.controller.js

import { providerService } from './provider.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const getProfile = asyncWrapper(async (req, res) => {
  const providerId = parseInt(req.params.id || req.user.id, 10);
  const data = await providerService.getProviderProfile(providerId);
  res.status(200).json({ success: true, data });
});

const updateMyProfile = asyncWrapper(async (req, res) => {
  const { bio, years_exp, service_radius_km } = req.body;
  const data = await providerService.updateMyProfile(req.user.id, {
    bio, years_exp, service_radius_km
  });
  res.status(200).json({ success: true, data });
});

const addOrUpdateService = asyncWrapper(async (req, res) => {
  const {
    service_category_id, price_per_hour,
    price_unit, min_booking_hours, description
  } = req.body;
  const data = await providerService.addOrUpdateService(req.user.id, {
    serviceCategoryId:  service_category_id,
    pricePerHour:       price_per_hour,
    priceUnit:          price_unit,
    minBookingHours:    min_booking_hours,
    description,
  });
  res.status(200).json({ success: true, data });
});

const removeService = asyncWrapper(async (req, res) => {
  const data = await providerService.removeService(
    req.user.id, parseInt(req.params.serviceId, 10)
  );
  res.status(200).json({ success: true, data });
});

export const providerController = {
  getProfile, updateMyProfile, addOrUpdateService, removeService
};