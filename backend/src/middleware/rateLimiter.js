// src/middleware/rateLimiter.js

import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

function createLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,   // Return rate limit info in RateLimit-* headers
    legacyHeaders:   false,
    handler: (req, res, next) => {
      next(new AppError('RATE_LIMIT_EXCEEDED', message, 429));
    },
  });
}

// Strict limit for auth endpoints to prevent brute force
export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  20,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

// Standard limit for most API routes
export const apiLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests. Please slow down.'
);

// Tighter limit for booking creation (prevent slot flooding)
export const bookingLimiter = createLimiter(
  60 * 1000, // 1 minute
  10,
  'Too many booking attempts. Please wait a moment.'
);