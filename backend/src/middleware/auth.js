// src/middleware/auth.js
// JWT verification middleware. Sets req.user on success.
// This middleware authenticates (WHO are you?).
// rbac.js handles authorization (are you ALLOWED?).

import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { userRepository } from '../modules/users/user.repository.js';
import { asyncWrapper } from '../utils/asyncWrapper.js';

export const authenticate = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];

  // jwt.verify throws JsonWebTokenError or TokenExpiredError on failure.
  // These are caught by the global error handler and formatted appropriately.
  const decoded = jwt.verify(token, env.jwt.secret, {
    issuer:   'booking-platform',
    audience: 'booking-platform-client',
  });

  // Fetch user from DB to ensure account still exists and is active.
  // Trade-off: one extra DB query per request vs potentially serving
  // deleted/deactivated users until token expires.
  // For a booking platform, the extra query is worth it.
  const user = await userRepository.findById(decoded.userId);

  if (!user) throw AppError.unauthorized('User account not found');
  if (!user.is_active) throw AppError.forbidden('Account has been deactivated');

  req.user = user;
  next();
});