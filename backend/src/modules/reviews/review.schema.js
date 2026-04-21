// src/modules/reviews/review.schema.js

import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    booking_id: z.number().int().positive(),
    rating:     z.number().int().min(1).max(5),
    comment:    z.string().max(2000).optional().nullable(),
  })
});