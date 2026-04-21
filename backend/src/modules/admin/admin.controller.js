// src/modules/admin/admin.controller.js



import { adminService } from './admin.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const getStats      = asyncWrapper(async (req, res) => {
  const data = await adminService.getStats();
  res.status(200).json({ success: true, data });
});

const getAllBookings = asyncWrapper(async (req, res) => {
  const result = await adminService.getAllBookings(req.query);
  res.status(200).json({ success: true, ...result });
});

const deactivateUser = asyncWrapper(async (req, res) => {
  const data = await adminService.setUserActiveStatus(
    parseInt(req.params.userId, 10), false, req.user.id
  );
  res.status(200).json({ success: true, data });
});

const activateUser = asyncWrapper(async (req, res) => {
  const data = await adminService.setUserActiveStatus(
    parseInt(req.params.userId, 10), true, req.user.id
  );
  res.status(200).json({ success: true, data });
});

const verifyProvider = asyncWrapper(async (req, res) => {
  const data = await adminService.verifyProvider(parseInt(req.params.providerId, 10));
  res.status(200).json({ success: true, data });
});

const getFlaggedReviews = asyncWrapper(async (req, res) => {
  const data = await adminService.getFlaggedReviews();
  res.status(200).json({ success: true, data });
});

const flagReview = asyncWrapper(async (req, res) => {
  const data = await adminService.flagReview(
    parseInt(req.params.reviewId, 10), req.body.reason
  );
  res.status(200).json({ success: true, data });
});

export const adminController = {
  getStats, getAllBookings, deactivateUser, activateUser,
  verifyProvider, getFlaggedReviews, flagReview
};