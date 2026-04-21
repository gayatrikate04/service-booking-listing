// src/modules/availability/availability.service.js

import { availabilityRepository } from './availability.repository.js';
import { AppError } from '../../utils/AppError.js';
import { intervalsOverlap, isFutureOrToday } from '../../utils/dateUtils.js';

async function getMyTemplates(providerId) {
  return availabilityRepository.findTemplatesByProvider(providerId);
}

async function addTemplate(providerId, { day_of_week, start_time, end_time, slot_duration_min }) {
  // Check for overlapping templates on the same day
  const existing = await availabilityRepository.findTemplatesByProvider(providerId);
  const sameDayTemplates = existing.filter(
    t => t.day_of_week === day_of_week && t.is_active
  );

  for (const t of sameDayTemplates) {
    if (intervalsOverlap(start_time, end_time, t.start_time, t.end_time)) {
      throw new AppError(
        'TEMPLATE_OVERLAP',
        `This time window overlaps with an existing template on ${getDayName(day_of_week)}`,
        409
      );
    }
  }

  const id = await availabilityRepository.createTemplate({
    providerId, dayOfWeek: day_of_week, startTime: start_time,
    endTime: end_time, slotDurationMin: slot_duration_min || 60
  });

  return availabilityRepository.findTemplatesByProvider(providerId);
}

async function updateTemplate(providerId, templateId, updates) {
  const updated = await availabilityRepository.updateTemplate(
    templateId, providerId, {
      startTime:       updates.start_time,
      endTime:         updates.end_time,
      slotDurationMin: updates.slot_duration_min,
      isActive:        updates.is_active,
    }
  );
  if (!updated) throw AppError.notFound('Availability template');
  return availabilityRepository.findTemplatesByProvider(providerId);
}

async function deleteTemplate(providerId, templateId) {
  const deleted = await availabilityRepository.deleteTemplate(templateId, providerId);
  if (!deleted) throw AppError.notFound('Availability template');
  return { message: 'Template deleted successfully' };
}

async function getAvailableSlots(providerId, date) {
  if (!date) throw AppError.validation('date query parameter is required (YYYY-MM-DD)');
  if (!isFutureOrToday(date)) {
    throw new AppError('PAST_DATE', 'Cannot retrieve slots for past dates', 422);
  }
  return availabilityRepository.findAvailableSlotsByProviderAndDate(providerId, date);
}

async function blockSlot(providerId, slotId) {
  const blocked = await availabilityRepository.blockSlot(slotId, providerId);
  if (!blocked) {
    throw new AppError('SLOT_NOT_BLOCKABLE', 'Slot not found or is not in available status', 409);
  }
  return { message: 'Slot blocked successfully' };
}

async function unblockSlot(providerId, slotId) {
  const unblocked = await availabilityRepository.unblockSlot(slotId, providerId);
  if (!unblocked) {
    throw new AppError('SLOT_NOT_UNBLOCKABLE', 'Slot not found or is not in blocked status', 409);
  }
  return { message: 'Slot unblocked successfully' };
}

function getDayName(dayNum) {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayNum];
}

export const availabilityService = {
  getMyTemplates, addTemplate, updateTemplate,
  deleteTemplate, getAvailableSlots, blockSlot, unblockSlot
};