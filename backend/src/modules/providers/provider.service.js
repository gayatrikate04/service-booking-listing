// src/modules/providers/provider.service.js

import { providerRepository } from './provider.repository.js';
import { AppError } from '../../utils/AppError.js';

async function getProviderProfile(providerId) {
  const profile = await providerRepository.findProfileByUserId(providerId);
  if (!profile) throw AppError.notFound('Provider');

  const services = await providerRepository.findServicesByProvider(providerId);
  return { ...profile, services };
}

async function updateMyProfile(userId, updates) {
  await providerRepository.updateProviderProfile(userId, updates);
  return providerRepository.findProfileByUserId(userId);
}

async function addOrUpdateService(providerId, serviceData) {
  if (!serviceData.serviceCategoryId || !serviceData.pricePerHour) {
    throw AppError.validation('serviceCategoryId and pricePerHour are required');
  }
  await providerRepository.upsertService({ providerId, ...serviceData });
  return providerRepository.findServicesByProvider(providerId);
}

async function removeService(providerId, serviceId) {
  const removed = await providerRepository.deactivateService(providerId, serviceId);
  if (!removed) throw AppError.notFound('Provider service');
  return { message: 'Service removed from your profile' };
}

export const providerService = {
  getProviderProfile, updateMyProfile, addOrUpdateService, removeService
};