const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AdminLogin, User } = require('../../Database/database');

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập username và password" });
    }
    const admin = await AdminLogin.findOne({ username, password });
    if (!admin) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }
    res.json({ message: "Đăng nhập thành công", admin: { username: admin.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    const newUser = new User({ username, email, password: hashedPassword, avatar });
    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.status(201).json({ message: "Đăng ký thành công", token, user: { username: newUser.username, email: newUser.email, avatar: newUser.avatar, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ message: "Đăng nhập thành công", token, user: { username: user.username, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  adminLogin,
  register,
  login
};
