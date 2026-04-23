const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // If token in header is invalid/placeholder, try cookies
  if (!token || token === 'undefined' || token === 'null') {
    token = req.cookies?.token || req.cookies?.adminToken;
  }

  if (!token) return next();
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (!err) {
      req.user = user;
    }
    next();
  });
};

module.exports = optionalAuth;
