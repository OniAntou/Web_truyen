const { Application, User } = require('../../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const submitApplication = asyncHandler(async (req, res) => {
  const { penName, portfolio, reason } = req.body;
  if (!penName || !reason) {
    throw new AppError("Vui lòng điền Bút danh và Lời giới thiệu", 400);
  }
  const existing = await Application.findOne({ user_id: req.user.id, status: { $in: ['pending', 'approved'] } });
  if (existing) {
    throw new AppError("Bạn đã nộp đơn rồi hoặc đã là tác giả.", 400);
  }
  
  const newApp = new Application({
    user_id: req.user.id,
    penName,
    portfolio,
    reason
  });
  await newApp.save();
  res.status(201).json({ message: "Nộp đơn thành công", application: newApp });
});

const getApplications = asyncHandler(async (req, res) => {
  const apps = await Application.find().populate('user_id', 'email username').sort({ created_at: -1 });
  res.json(apps);
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError("Trạng thái không hợp lệ", 400);
  }
  
  const appDoc = await Application.findById(req.params.id);
  if (!appDoc) {
    throw new AppError("Không tìm thấy đơn", 404);
  }
  
  appDoc.status = status;
  await appDoc.save();
  
  if (status === 'approved') {
    await User.findByIdAndUpdate(appDoc.user_id, { role: 'creator' });
  }
  
  res.json({ message: `Đã ${status} đơn ứng tuyển`, application: appDoc });
});

module.exports = {
  submitApplication,
  getApplications,
  updateApplicationStatus
};
