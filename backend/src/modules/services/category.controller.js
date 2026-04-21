// src/modules/services/category.controller.js

import { categoryService } from './category.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const list = asyncWrapper(async (req, res) => {
  const includeInactive = req.user?.role === 'admin' && req.query.all === 'true';
  const data = await categoryService.listCategories(includeInactive);
  res.status(200).json({ success: true, data });
});

const getBySlug = asyncWrapper(async (req, res) => {
  const data = await categoryService.getCategoryBySlug(req.params.slug);
  res.status(200).json({ success: true, data });
});

const create = asyncWrapper(async (req, res) => {
  const data = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data });
});

const update = asyncWrapper(async (req, res) => {
  const data = await categoryService.updateCategory(
    parseInt(req.params.id, 10), req.body
  );
  res.status(200).json({ success: true, data });
});

const searchProviders = asyncWrapper(async (req, res) => {
  const result = await categoryService.searchProvidersByCategory(
    parseInt(req.params.id, 10), req.query
  );
  res.status(200).json({ success: true, ...result });
});

export const categoryController = { list, getBySlug, create, update, searchProviders };