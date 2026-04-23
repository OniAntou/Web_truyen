const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If token in header is invalid/placeholder, try cookies
  if (!token || token === 'undefined' || token === 'null') {
    // Priority: If the request is for an admin route, prefer adminToken. 
    // Otherwise, prefer regular token but fall back to adminToken.
    const isAdminRoute = req.originalUrl && req.originalUrl.includes('/admin');
    if (isAdminRoute) {
        token = req.cookies?.adminToken || req.cookies?.token;
    } else {
        token = req.cookies?.token || req.cookies?.adminToken;
    }
  }

  if (!token) return res.status(401).json({ message: "Không tìm thấy token" });
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
