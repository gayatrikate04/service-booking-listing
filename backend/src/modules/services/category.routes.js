// src/modules/services/category.routes.js

import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';

export const categoryRouter = Router();

// Public routes
categoryRouter.get('/',           categoryController.list);
categoryRouter.get('/:slug',      categoryController.getBySlug);
categoryRouter.get('/:id/providers', categoryController.searchProviders);

// Admin-only routes
categoryRouter.post('/',          authenticate, authorize('admin'), categoryController.create);
categoryRouter.patch('/:id',      authenticate, authorize('admin'), categoryController.update);