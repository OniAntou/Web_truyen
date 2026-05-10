import AppError from "../utils/AppError";

/**
 * Custom CSRF protection middleware
 * Checks Origin/Referer and Custom Header
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:4173'];

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // 1. Check Origin
  if (origin) {
    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, '') === cleanOrigin);
    if (!isAllowed) {
      return next(new AppError('CSRF Protection: Invalid Origin', 403));
    }
  }

  // 2. Check Referer (fallback if origin is missing)
  if (!origin && referer) {
    const refererOrigin = new URL(referer).origin;
    if (!allowedOrigins.includes(refererOrigin)) {
      return next(new AppError('CSRF Protection: Invalid Referer', 403));
    }
  }

  // 3. Require a custom header (Standard technique for modern SPAs)
  // Most CSRF attacks (form submissions) cannot set custom headers
  // Allow requests without Origin/Referer (server-to-server, mobile apps, etc.)
  if (!origin && !referer) {
    return next();
  }

  // For browser requests, require a custom header that CSRF attacks cannot set
  if (!req.headers['x-requested-with'] && !req.headers['x-csrf-token'] && !req.headers['content-type']?.includes('application/json')) {
    return next(new AppError('CSRF Protection: Missing custom security header', 403));
  }

  next();
};

/**
 * Simple NoSQL Injection Sanitizer
 * Removes keys starting with $ from req.body, query, and params
 */
const mongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      });
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

export { 
  csrfProtection,
  mongoSanitize
 };
