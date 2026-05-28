# ComicVerse Bot

Bot cào truyện từ các nguồn khác (blogtruyen.vn, ...) và tự động đăng lên ComicVerse.

## Cài đặt

```bash
cd Backend/bot
npm install
```

## Cấu hình

Copy `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

Sửa file `.env`:

```
API_URL=http://localhost:5000/api
AUTH_EMAIL=email_cua_ban@example.com
AUTH_PASSWORD=mat_khau_cua_ban
```

## Sử dụng

```bash
# Windows (PowerShell)
$env:NODE_NO_WARNINGS=1; npx tsx src/index.ts https://blogtruyen.vn/xxx/yyy

# Chỉ cào 5 chapter đầu
npx tsx src/index.ts https://blogtruyen.vn/xxx/yyy --max-chapters 5

# Tùy chỉnh số luồng tải
npx tsx src/index.ts https://blogtruyen.vn/xxx/yyy --concurrency 5 --delay 500

# Chỉ lấy metadata, không tải ảnh
npx tsx src/index.ts https://blogtruyen.vn/xxx/yyy --no-images
```

## Yêu cầu

- Node.js 20+
- API ComicVerse đang chạy
- Tài khoản có quyền creator hoặc admin trên ComicVerse
