// src/modules/providers/provider.routes.js

import { Router } from 'express';
import { providerController } from './provider.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';

export const providerRouter = Router();

// Public: view any provider's profile
providerRouter.get('/:id', providerController.getProfile);

// Provider-only: manage own profile and services
providerRouter.use(authenticate);

providerRouter.get('/me/profile',         authorize('provider'), providerController.getProfile);
providerRouter.patch('/me/profile',       authorize('provider'), providerController.updateMyProfile);
providerRouter.post('/me/services',       authorize('provider'), providerController.addOrUpdateService);
providerRouter.delete('/me/services/:serviceId', authorize('provider'), providerController.removeService);