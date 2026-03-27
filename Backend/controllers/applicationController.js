const { Application, User } = require('../../Database/database');

const submitApplication = async (req, res) => {
  try {
    const { penName, portfolio, reason } = req.body;
    if (!penName || !reason) {
      return res.status(400).json({ message: "Vui lòng điền Bút danh và Lời giới thiệu" });
    }
    const existing = await Application.findOne({ user_id: req.user.id, status: { $in: ['pending', 'approved'] } });
    if (existing) {
      return res.status(400).json({ message: "Bạn đã nộp đơn rồi hoặc đã là tác giả." });
    }
    
    const newApp = new Application({
      user_id: req.user.id,
      penName,
      portfolio,
      reason
    });
    await newApp.save();
    res.status(201).json({ message: "Nộp đơn thành công", application: newApp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const apps = await Application.find().populate('user_id', 'email username').sort({ created_at: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    
    const appDoc = await Application.findById(req.params.id);
    if (!appDoc) {
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    }
    
    appDoc.status = status;
    await appDoc.save();
    
    if (status === 'approved') {
      await User.findByIdAndUpdate(appDoc.user_id, { role: 'creator' });
    }
    
    res.json({ message: `Đã ${status} đơn ứng tuyển`, application: appDoc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submitApplication,
  getApplications,
  updateApplicationStatus
};
