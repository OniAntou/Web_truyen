import jwt from "jsonwebtoken";
import { AdminLogin, User } from "../database";
import { isAdmin, Principal } from "../utils/accessControl";

const getAuthToken = (req) => {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.split(" ")[1];

  if (!token || token === "undefined" || token === "null" || token === "[object Object]") {
    const isAdminRoute = req.originalUrl?.includes("/admin");
    token = isAdminRoute
      ? req.cookies?.adminToken || req.cookies?.token
      : req.cookies?.token || req.cookies?.adminToken;
  }

  return token;
};

const resolveCurrentPrincipal = async (token: string, secret: string): Promise<Principal | null> => {
  const decoded = jwt.verify(token, secret) as { id?: string; role?: string };
  if (!decoded.id) return null;

  const user = await User.findById(decoded.id).select("_id role").lean();
  if (user) {
    return { id: String(user._id), role: user.role } as Principal;
  }

  // The legacy admin panel uses AdminLogin rather than the User collection.
  if (decoded.role === "admin") {
    const admin = await AdminLogin.findById(decoded.id).select("_id").lean();
    if (admin) return { id: String(admin._id), role: "admin" };
  }

  return null;
};

const authenticateToken = async (req, res, next) => {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ message: "Không tìm thấy token" });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("CRITICAL: JWT_SECRET is missing in environment variables.");
    return res.status(500).json({ message: "Lỗi cấu hình máy chủ: Thiếu JWT_SECRET" });
  }

  try {
    const principal = await resolveCurrentPrincipal(token, secret);
    if (!principal) {
      return res.status(401).json({ message: "Tài khoản không tồn tại hoặc đã bị thu hồi quyền" });
    }
    req.user = principal;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      console.log(`[AUTH] Token verification failed: ${err.message}. Token: ${token.substring(0, 10)}...`);
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

export { authenticateToken as default, requireAdmin, getAuthToken, resolveCurrentPrincipal };
