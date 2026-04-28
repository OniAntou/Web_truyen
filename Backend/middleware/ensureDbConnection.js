const { connectDB } = require("../Database/database");

const ensureDbConnection = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB] %s %s', req.method, req.originalUrl, err);
    res.status(503).json({
      message: "Khong the ket noi co so du lieu luc nay. Vui long thu lai sau.",
    });
  }
};

module.exports = ensureDbConnection;
