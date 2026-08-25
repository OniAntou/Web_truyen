# Impeccable detector — các ngoại lệ có chủ đích

File này là input duy nhất mà `/impeccable critique` đọc từ lần chạy trước.
Mỗi mục ghi rõ tại sao finding tương ứng KHÔNG phải defect — critique sau này
không được flag lại trừ khi ngữ cảnh thay đổi.

## gray-on-color — `Client/src/layouts/AdminLayout.tsx:119`

False positive. Class thật là `text-zinc-500 ... hover:bg-red-500/10 hover:text-red-500`:
gray không bao giờ nằm trên nền đỏ đặc — đỏ chỉ xuất hiện ở hover với opacity 10%
khi text đã chuyển sang đỏ.

## marquee — `.lazy-image-skeleton` (`index.css`)

Skeleton shimmer là loading feedback có chức năng (đang chờ ảnh chapter load),
không phải animation trang trí. Giữ nguyên.

## single-font (chỉ Outfit)

Lựa chọn brand: một font family cho toàn app. Thêm font là quyết định redesign,
không phải lỗi detector.

## dark-glow trên chip/CTA dùng `--accent`

Bóng có offset + blur (shadow-md/lg) — là elevation, không phải halo zero-offset.
Halo zero-offset thật (vd `0 0 10px`) đã bị xóa (AboutPage dot, GenresPage chip,
AuthPage submit).
