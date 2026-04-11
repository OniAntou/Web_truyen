const AppError = require('../utils/AppError');

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        // Lấy message lỗi đầu tiên
        const message = error.errors[0].message;
        next(new AppError(message, 400));
      } else {
        next(error);
      }
    }
  };
};

module.exports = validateRequest;
