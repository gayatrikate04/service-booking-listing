// src/utils/asyncWrapper.js
// Eliminates try/catch boilerplate in route handlers.
// Every async route handler is wrapped so unhandled promise rejections
// are automatically forwarded to Express's next(err) error pipeline.
//
// Without this: forgetting try/catch causes silent hanging requests.
// With this: any thrown error or rejected promise goes to errorHandler.js.

export const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};