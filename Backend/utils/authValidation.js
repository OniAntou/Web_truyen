const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: 'Vui lòng nhập tên hiển thị',
    }).min(3, 'Tên hiển thị phải có ít nhất 3 ký tự').max(50, 'Tên hiển thị quá dài'),
    email: z.string({
      required_error: 'Vui lòng nhập email',
    }).email('Email không hợp lệ'),
    password: z.string({
      required_error: 'Vui lòng nhập mật khẩu',
    }).min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Vui lòng nhập email',
    }).email('Email không hợp lệ').optional().or(z.literal('')), // allow fallback if username used in some UI, but strictly wait, email is used in authController logic for login.
    password: z.string({
      required_error: 'Vui lòng nhập mật khẩu',
    }).min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }).refine((data) => data.email && data.email.length > 0, {
    message: "Vui lòng nhập email hợp lệ",
    path: ["email"]
  })
});

const adminLoginSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: 'Vui lòng nhập tên đăng nhập',
    }).min(1, 'Vui lòng nhập tên đăng nhập'),
    password: z.string({
      required_error: 'Vui lòng nhập mật khẩu',
    }).min(1, 'Vui lòng nhập mật khẩu'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  adminLoginSchema,
};
