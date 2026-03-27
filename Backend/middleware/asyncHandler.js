/**
 * Wraps an async route handler so that any rejected promise
 * is automatically forwarded to Express's error-handling middleware
 * via next(err), eliminating repetitive try-catch blocks.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
