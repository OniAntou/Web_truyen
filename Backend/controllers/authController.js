const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { AdminLogin, User } = require('../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { sendPasswordResetEmail } = require('../utils/email');

const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new AppError("Vui lòng nhập username và password", 400);
  }
  const admin = await AdminLogin.findOne({ username });
  if (!admin) {
    throw new AppError("Sai tên đăng nhập hoặc mật khẩu", 401);
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError("Sai tên đăng nhập hoặc mật khẩu", 401);
  }
  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  
  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : (req.secure || req.headers['x-forwarded-proto'] === 'https'),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ message: "Đăng nhập thành công", admin: { username: admin.username } });
});

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new AppError("Vui lòng nhập đầy đủ thông tin", 400);
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email đã được sử dụng", 400);
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();
  
  const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : (req.secure || req.headers['x-forwarded-proto'] === 'https'),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({ message: "Đăng ký thành công", user: { username: newUser.username, email: newUser.email, role: newUser.role } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Vui lòng nhập đầy đủ thông tin", 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Sai email hoặc mật khẩu", 401);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Sai email hoặc mật khẩu", 401);
  }
  
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : (req.secure || req.headers['x-forwarded-proto'] === 'https'),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ message: "Đăng nhập thành công", user: { username: user.username, email: user.email, role: user.role } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : (req.secure || req.headers['x-forwarded-proto'] === 'https'),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: "Đăng xuất người dùng thành công" });
});

const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : (req.secure || req.headers['x-forwarded-proto'] === 'https'),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: "Đăng xuất Admin thành công" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Vui lòng nhập email", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists — always return success
    return res.json({ message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  // Build reset URL
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (err) {
    // If email fails, clear the reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw new AppError("Không thể gửi email. Vui lòng thử lại sau.", 500);
  }

  res.json({ message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new AppError("Mật khẩu phải có ít nhất 6 ký tự", 400);
  }

  // Hash the token from URL to compare with DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError("Token không hợp lệ hoặc đã hết hạn", 400);
  }

  // Update password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
});

module.exports = {
  adminLogin,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword
};
