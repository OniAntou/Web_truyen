import AppError from "../utils/AppError";
import { ZodError, type ZodType } from "zod";

const getZodErrorMessage = (error: unknown) =>
  (error instanceof ZodError && error.issues?.[0]?.message) || "Dữ liệu không hợp lệ";

const validateRequest = (schema: ZodType) => {
  return (req, res, next) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(getZodErrorMessage(error), 400));
      } else {
        next(error);
      }
    }
  };
};

export default validateRequest;
export { getZodErrorMessage };
