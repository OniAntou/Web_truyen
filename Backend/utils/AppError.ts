/**
 * Custom application error class with HTTP status code support.
 * Throw this in controllers to produce meaningful error responses
 * without manually calling res.status().json().
 *
 * Usage: throw new AppError('Comic not found', 404);
 */
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
