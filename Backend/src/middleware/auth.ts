import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If token in header is invalid/placeholder, try cookies
  if (!token || token === 'undefined' || token === 'null' || token === '[object Object]') {
    const isAdminRoute = req.originalUrl && req.originalUrl.includes('/admin');
    if (isAdminRoute) {
        token = req.cookies?.adminToken || req.cookies?.token;
    } else {
        token = req.cookies?.token || req.cookies?.adminToken;
    }
  }

  if (!token) return res.status(401).json({ message: "Không tìm thấy token" });
  
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV !== 'production') {
    console.warn('WARNING: JWT_SECRET is missing in environment variables. Using fallback_secret.');
  }

  jwt.verify(token, secret || 'fallback_secret', (err, user) => {
    if (err) {
      console.log(`[AUTH] Token verification failed: ${err.message}. Token: ${token?.substring(0, 10)}...`);
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

export { authenticateToken as default, requireAdmin };
