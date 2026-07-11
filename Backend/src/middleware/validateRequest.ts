import AppError from "../utils/AppError";

const getZodErrorMessage = (error) =>
  error.issues?.[0]?.message || "Dữ liệu không hợp lệ";

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        next(new AppError(getZodErrorMessage(error), 400));
      } else {
        next(error);
      }
    }
  };
};

export default validateRequest;
export { getZodErrorMessage };
