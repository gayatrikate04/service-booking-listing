// src/modules/admin/admin.routes.js



import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';

export const adminRouter = Router();

// All admin routes require authentication + admin role
adminRouter.use(authenticate, authorize('admin'));

adminRouter.get('/stats',                              adminController.getStats);
adminRouter.get('/bookings',                           adminController.getAllBookings);
adminRouter.get('/reviews/flagged',                    adminController.getFlaggedReviews);
adminRouter.patch('/users/:userId/deactivate',         adminController.deactivateUser);
adminRouter.patch('/users/:userId/activate',           adminController.activateUser);
adminRouter.patch('/providers/:providerId/verify',     adminController.verifyProvider);
adminRouter.patch('/reviews/:reviewId/flag',           adminController.flagReview);