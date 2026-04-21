// src/modules/availability/availability.routes.js

import { Router } from 'express';
import { availabilityController } from './availability.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';

export const availabilityRouter = Router();

// Public: customers check available slots for a provider
availabilityRouter.get(
  '/providers/:providerId/slots',
  availabilityController.getAvailableSlots
);

// Provider-only routes
availabilityRouter.use(authenticate, authorize('provider'));

availabilityRouter.get('/templates',                    availabilityController.getTemplates);
availabilityRouter.post('/templates',                   availabilityController.addTemplate);
availabilityRouter.patch('/templates/:templateId',      availabilityController.updateTemplate);
availabilityRouter.delete('/templates/:templateId',     availabilityController.deleteTemplate);
availabilityRouter.patch('/slots/:slotId/block',        availabilityController.blockSlot);
availabilityRouter.patch('/slots/:slotId/unblock',      availabilityController.unblockSlot);