// src/middleware/errorHandler.js
// Global Express error handler. Must be registered LAST in app.js.
// All errors thrown anywhere in the request pipeline end up here.

import { AppError } from '../utils/AppError.js';
import { handleDbError } from '../utils/dbErrors.js';
import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  // Attempt to translate MySQL errors first
  const dbError = err.errno ? handleDbError(err) : null;
  const error = dbError || err;

  // Log with full context for debugging
  logger.error({
    message:    error.message,
    code:       error.code,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    stack:      error.stack,
    request: {
      method:   req.method,
      url:      req.originalUrl,
      userId:   req.user?.id,
      ip:       req.ip,
    }
  });

  // Operational errors: safe to expose details to client
  if (error instanceof AppError && error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code:    error.code,
        message: error.message,
      }
    });
  }

  // Zod validation errors (from middleware/validate.js)
  if (error.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.issues.map(e => ({
          field:   e.path.join('.'),
          message: e.message,
        }))
      }
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token' }
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired' }
    });
  }

  // Non-operational / unknown errors: hide internals from client
  // In development, include the stack for debugging
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      ...(isDev && { stack: error.stack, raw: error.message })
    }
  });
}