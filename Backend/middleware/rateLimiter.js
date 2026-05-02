const rateLimit = require('express-rate-limit');

/**
 * Centralized Rate Limiting Configuration
 * 
 * Tiers:
 * - STRICT:   Auth/sensitive endpoints (login, register, password reset)
 * - WRITE:    State-changing operations (POST/PUT/DELETE on resources)
 * - UPLOAD:   File upload endpoints (cover, chapter pages)
 * - PAYMENT:  Payment-related endpoints
 * - REPORT:   User report submission
 * - INTERACT: User interactions (rate, comment, favorite, view)
 * - READ:     Read-heavy public endpoints (comics, chapters, genres)
 * - ADMIN:    Admin panel operations
 * - GLOBAL:   Catch-all fallback for all /api routes
 */

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { message },
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,     // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use X-Forwarded-For on reverse proxy, fallback to req.ip
    return req.ip;
  },
});

// ──────────────────────────────────────────────────────
// Auth: Brute-force protection
// ──────────────────────────────────────────────────────
const authLimiter = createLimiter(
  15 * 60 * 1000,   // 15 minutes
  15,               // 15 attempts
  'Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút.'
);

// ──────────────────────────────────────────────────────
// Write: Create/Update/Delete resources
// ──────────────────────────────────────────────────────
const writeLimiter = createLimiter(
  15 * 60 * 1000,   // 15 minutes
  60,               // 60 write operations
  'Bạn đang thực hiện quá nhiều thao tác. Vui lòng chờ một lát.'
);

// ──────────────────────────────────────────────────────
// Upload: File uploads (larger window, lower count)
// ──────────────────────────────────────────────────────
const uploadLimiter = createLimiter(
  60 * 60 * 1000,   // 1 hour
  30,               // 30 uploads per hour
  'Bạn đã upload quá nhiều file. Vui lòng thử lại sau.'
);

// ──────────────────────────────────────────────────────
// Payment: Prevent payment spam
// ──────────────────────────────────────────────────────
const paymentLimiter = createLimiter(
  15 * 60 * 1000,   // 15 minutes
  10,               // 10 payment requests
  'Quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau.'
);

// ──────────────────────────────────────────────────────
// Report: Prevent report flooding
// ──────────────────────────────────────────────────────
const reportLimiter = createLimiter(
  60 * 60 * 1000,   // 1 hour
  10,               // 10 reports per hour
  'Bạn đã gửi quá nhiều báo cáo. Vui lòng thử lại sau.'
);

// ──────────────────────────────────────────────────────
// Interaction: Comments, ratings, favorites, views
// ──────────────────────────────────────────────────────
const interactionLimiter = createLimiter(
  15 * 60 * 1000,   // 15 minutes
  100,              // 100 interactions
  'Bạn đang tương tác quá nhanh. Vui lòng chậm lại.'
);

// ──────────────────────────────────────────────────────
// Read: Public read endpoints (comics, chapters, genres)
// ──────────────────────────────────────────────────────
const readLimiter = createLimiter(
  15 * 60 * 1000,   // 15 minutes
  300,              // 300 reads
  'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
);

// ──────────────────────────────────────────────────────
// Admin: Admin panel operations
// ──────────────────────────────────────────────────────
const adminLimiter = createLimiter(
  15 * 60 * 1000,   // 15 minutes
  200,              // 200 admin requests
  'Quá nhiều thao tác admin. Vui lòng thử lại sau.'
);

// ──────────────────────────────────────────────────────
// Global: Catch-all fallback
// ──────────────────────────────────────────────────────
const globalLimiter = createLimiter(
  15 * 60 * 1000,   // 15 minutes
  1000,             // 1000 total requests
  'Quá nhiều yêu cầu từ IP này. Hệ thống đang tạm thời chặn để bảo vệ máy chủ.'
);

module.exports = {
  authLimiter,
  writeLimiter,
  uploadLimiter,
  paymentLimiter,
  reportLimiter,
  interactionLimiter,
  readLimiter,
  adminLimiter,
  globalLimiter,
};
