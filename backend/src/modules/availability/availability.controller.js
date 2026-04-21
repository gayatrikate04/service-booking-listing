// src/modules/availability/availability.controller.js

import { availabilityService } from './availability.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const getTemplates = asyncWrapper(async (req, res) => {
  const data = await availabilityService.getMyTemplates(req.user.id);
  res.status(200).json({ success: true, data });
});

const addTemplate = asyncWrapper(async (req, res) => {
  const data = await availabilityService.addTemplate(req.user.id, req.body);
  res.status(201).json({ success: true, data });
});

const updateTemplate = asyncWrapper(async (req, res) => {
  const data = await availabilityService.updateTemplate(
    req.user.id, parseInt(req.params.templateId, 10), req.body
  );
  res.status(200).json({ success: true, data });
});

const deleteTemplate = asyncWrapper(async (req, res) => {
  const data = await availabilityService.deleteTemplate(
    req.user.id, parseInt(req.params.templateId, 10)
  );
  res.status(200).json({ success: true, data });
});

const getAvailableSlots = asyncWrapper(async (req, res) => {
  const data = await availabilityService.getAvailableSlots(
    parseInt(req.params.providerId, 10), req.query.date
  );
  res.status(200).json({ success: true, data });
});

const blockSlot = asyncWrapper(async (req, res) => {
  const data = await availabilityService.blockSlot(
    req.user.id, parseInt(req.params.slotId, 10)
  );
  res.status(200).json({ success: true, data });
});

const unblockSlot = asyncWrapper(async (req, res) => {
  const data = await availabilityService.unblockSlot(
    req.user.id, parseInt(req.params.slotId, 10)
  );
  res.status(200).json({ success: true, data });
});

export const availabilityController = {
  getTemplates, addTemplate, updateTemplate,
  deleteTemplate, getAvailableSlots, blockSlot, unblockSlot
};