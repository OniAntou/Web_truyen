import { getAuthToken, resolveCurrentPrincipal } from "./auth";

const optionalAuth = async (req, res, next) => {
  const token = getAuthToken(req);
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return next();

  try {
    const principal = await resolveCurrentPrincipal(token, secret);
    if (principal) req.user = principal;
  } catch {
    // Public endpoints remain readable when an optional token is invalid.
  }

  next();
};

export default optionalAuth;
