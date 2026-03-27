const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AdminLogin, User } = require('../../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new AppError("Vui lòng nhập username và password", 400);
  }
  const admin = await AdminLogin.findOne({ username, password });
  if (!admin) {
    throw new AppError("Sai tên đăng nhập hoặc mật khẩu", 401);
  }
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
  const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const newUser = new User({ username, email, password: hashedPassword, avatar });
  await newUser.save();
  
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  res.status(201).json({ message: "Đăng ký thành công", token, user: { username: newUser.username, email: newUser.email, avatar: newUser.avatar, role: newUser.role } });
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
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  res.json({ message: "Đăng nhập thành công", token, user: { username: user.username, email: user.email, avatar: user.avatar, role: user.role } });
});

module.exports = {
  adminLogin,
  register,
  login
};
