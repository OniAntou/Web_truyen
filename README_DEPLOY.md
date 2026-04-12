# Hướng dẫn Triển khai SkyComic (Production Deployment Guide)

Tài liệu này hướng dẫn bạn cách đưa website từ môi trường phát triển lên môi trường chạy thật (Production).

---

## 1. Cấu hình Biến môi trường (.env)

Trên server thật, bạn cần tạo file `.env` với các thông tin sau:

```env
# Database & Auth
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_very_secure_random_string

# Lưu trữ (R2/S3)
S3_ACCESS_KEY=your_key
S3_SECRET_KEY=your_secret
S3_BUCKET_NAME=your_bucket
S3_ENDPOINT=your_endpoint

# Thanh toán (VNPay)
VNP_TMN_CODE=your_vnpay_code
VNP_HASH_SECRET=your_vnpay_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=https://your-domain.com/payment/vnpay_return

# Email (SMTP) - Để kích hoạt Quên mật khẩu thật
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=SkyComic <noreply@your-domain.com>

# Bảo mật (CORS)
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
CLIENT_URL=https://your-domain.com
```

---

## 2. Cách lấy mật khẩu ứng dụng Gmail (App Password)

Nếu bạn dùng Gmail để gửi mail khôi phục mật khẩu:
1. Vào **Google Account** -> **Security**.
2. Bật **2-Step Verification**.
3. Tìm phần **App passwords**.
4. Chọn "Other" và đặt tên là "SkyComic".
5. Copy mã 16 ký tự và dán vào `SMTP_PASS` trong file `.env`.

---

## 3. Triển khai Backend

1. Upload code thư mục `Backend` lên server (VPS, Render, Railway, v.v.).
2. Chạy lệnh cài đặt: `npm install`.
3. Chạy lệnh bắt đầu: `npm start`.

---

## 4. Triển khai Frontend

1. Truy cập vào thư mục `Client`.
2. Mở file `src/constants/api.js` và đảm bảo `API_BASE_URL` trỏ vào domain backend thật.
3. Chạy lệnh build: `npm run build`.
4. Một thư mục `dist` sẽ được tạo ra.
5. Upload nội dung trong `dist` lên dịch vụ hosting frontend (Vercel, Netlify, hoặc Hostinger).

---

## 5. Lưu ý về Pháp lý

- Các trang **Điều khoản**, **Bảo mật**, **Giới thiệu** đã được tạo sẵn nội dung mẫu.
- Bạn nên đọc lại và chỉnh sửa thông tin cho phù hợp với chính sách riêng của bạn trước khi công khai website.

---

**Chúc bạn thành công với SkyComic!**
