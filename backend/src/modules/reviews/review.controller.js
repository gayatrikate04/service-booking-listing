// src/modules/reviews/review.controller.js

import { reviewService } from './review.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const create = asyncWrapper(async (req, res) => {
  const data = await reviewService.createReview(req.user.id, req.body);
  res.status(201).json({ success: true, data });
});

const getProviderReviews = asyncWrapper(async (req, res) => {
  const data = await reviewService.getProviderReviews(
    parseInt(req.params.providerId, 10), req.query
  );
  res.status(200).json({ success: true, ...data });
});

const getMyReviews = asyncWrapper(async (req, res) => {
  const data = await reviewService.getMyReviews(req.user.id);
  res.status(200).json({ success: true, data });
});

export const reviewController = { create, getProviderReviews, getMyReviews };