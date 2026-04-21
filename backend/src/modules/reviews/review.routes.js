// src/modules/reviews/review.routes.js

import { Router } from 'express';
import { reviewController } from './review.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createReviewSchema } from './review.schema.js';

export const reviewRouter = Router();

reviewRouter.get('/provider/:providerId', reviewController.getProviderReviews);

reviewRouter.use(authenticate);

reviewRouter.post('/',
  authorize('customer'),
  validate(createReviewSchema),
  reviewController.create
);

reviewRouter.get('/my', authorize('customer'), reviewController.getMyReviews);