// src/modules/services/category.service.js

import { categoryRepository } from './category.repository.js';
import { AppError } from '../../utils/AppError.js';
import { getPaginationParams } from '../../utils/pagination.js';

async function listCategories(includeInactive = false) {
  return categoryRepository.findAll({ includeInactive });
}

async function getCategoryBySlug(slug) {
  const category = await categoryRepository.findBySlug(slug);
  if (!category) throw AppError.notFound('Service category');
  return category;
}

async function createCategory(data) {
  const existing = await categoryRepository.findBySlug(data.slug);
  if (existing) {
    throw AppError.conflict('SLUG_TAKEN', `A category with slug '${data.slug}' already exists`);
  }
  const id = await categoryRepository.create(data);
  return categoryRepository.findById(id);
}

async function updateCategory(id, fields) {
  const category = await categoryRepository.findById(id);
  if (!category) throw AppError.notFound('Service category');
  await categoryRepository.update(id, fields);
  return categoryRepository.findById(id);
}

async function searchProvidersByCategory(categoryId, query) {
  const category = await categoryRepository.findById(categoryId);
  if (!category || !category.is_active) throw AppError.notFound('Service category');

  if (!query.city) {
    throw new AppError('CITY_REQUIRED', 'city is required for provider search', 422);
  }

  const { page, pageSize } = getPaginationParams(query);
  const { providers, total } = await categoryRepository.findProvidersByCategory(
    categoryId,
    { city: query.city, minRating: parseFloat(query.minRating || 0), page, pageSize }
  );

  return {
    category,
    providers,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  };
}

export const categoryService = {
  listCategories, getCategoryBySlug, createCategory, updateCategory, searchProvidersByCategory
};