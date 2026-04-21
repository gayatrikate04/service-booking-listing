// src/utils/AppError.js
// Custom error class that carries: HTTP status code, machine-readable code,
// and an isOperational flag.
//
// isOperational = true: expected errors (validation fails, slot unavailable).
//   → safe to send error details to client
//   → do not alert on-call engineer
//
// isOperational = false: programming errors (null reference, DB schema mismatch).
//   → send generic "something went wrong" to client
//   → alert on-call engineer
//   → crash process in extreme cases

// I created a custom AppError class to standardize error handling across the backend. 
// It allows us to attach HTTP status codes, machine-readable error codes, and an operational 
// flag to distinguish expected business errors from programming errors. 
// This helps the global error handler send safe responses to clients while logging detailed 
// debugging information for developers.




export class AppError extends Error {
  constructor(code, message, statusCode = 500, isOperational = true) {
    super(message);
    this.code       = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Captures the correct stack trace (excludes AppError constructor itself)
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-defined factory methods for common errors — reduces typos in error codes
// and ensures consistent HTTP status codes across the codebase.
// {
//  "code": "NOT_FOUND",
//  "message": "Booking not found",
//  "statusCode": 404
// }
AppError.notFound = (resource) =>
  new AppError('NOT_FOUND', `${resource} not found`, 404);

// {
//  "code": "UNAUTHORIZED",
//  "message": "Authentication required"
// }
AppError.unauthorized = (msg = 'Authentication required') =>
  new AppError('UNAUTHORIZED', msg, 401);

// User logged in but not allowed.
AppError.forbidden = (msg = 'Insufficient permissions') =>
  new AppError('FORBIDDEN', msg, 403);

// // throw AppError.conflict(
//  "SLOT_TAKEN",
//  "Slot already booked"
// );
AppError.conflict = (code, msg) =>
  new AppError(code, msg, 409);

// throw AppError.validation("Email is invalid");
AppError.validation = (msg) =>
  new AppError('VALIDATION_ERROR', msg, 422);

// Internal server error
AppError.internal = (msg = 'Internal server error') =>
  new AppError('INTERNAL_ERROR', msg, 500, false);