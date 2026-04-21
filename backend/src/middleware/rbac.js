// src/middleware/rbac.js
// Authorization middleware factory.
// Usage: authorize('provider') or authorize('admin', 'provider')
// Must be used AFTER authenticate — relies on req.user being set.

import { AppError } from '../utils/AppError.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // Defensive check: authorize should never be used without authenticate
      return next(AppError.internal('authorize() used without authenticate()'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}