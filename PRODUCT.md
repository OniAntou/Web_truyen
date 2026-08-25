# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Độc giả truyện tranh tiếng Việt đa nền tảng. Dùng desktop vào buổi tối để khám phá và theo dõi nhiều bộ; dùng điện thoại để đọc nhanh mọi lúc. Job-to-be-done: tìm bộ mới đáng đọc, theo dõi các bộ đang đọc, và đọc chương một cách mượt mà, không nhiễu. Các đối tượng phụ đã xác nhận trong code (chưa phỏng vấn): tác giả/nhóm dịch đăng chapter, và quản trị viên vận hành nội dung.

## Product Purpose

ComicVerse là nền tảng đọc truyện tranh tiếng Việt full-stack: độc giả đọc truyện, tác giả đăng tải, quản trị viên vận hành. Thành công nghĩa là độc giả quay lại đều để đọc chương mới và có trải nghiệm đọc sạch, tập trung.

## Positioning

"Nơi đọc không nhiễu": trải nghiệm đọc sạch, tập trung — thiết kế phục tùng nội dung thay vì cạnh tranh với nó. Một trang khác khó sao chép trung thực điều này nếu giao diện họ ưu tiên quảng cáo/tương tác hơn sự tập trung của người đọc.

## Operating Context

- Web SPA (React 19 + Vite + TypeScript + Tailwind 3), backend Express 5 + MongoDB + Cloudflare R2, deploy Vercel tách hai project (`Client/`, `Backend/`).
- Chapter upload bị giới hạn 3 file × 8 MB mỗi request; client phải batch chapter lớn hơn.
- Quy trình phát hành theo checklist `docs/production-readiness.md`: smoke test `/api/health`, `/api/ready`, auth, upload chapter, đọc, VNPay-return.

## Capabilities and Constraints

- Đã xác nhận từ code: reader truyện, duyệt theo thể loại/mới/phổ biến/xếp hạng/tìm kiếm, auth người dùng, bình luận, báo cáo vi phạm, creator upload, admin panel, thanh toán VNPay (backend), dark/light theme (`themeStore`), song ngữ VI/EN (`translations.ts`, `languageStore`).
- Ràng buộc kỹ thuật: giới hạn upload nêu trên; không expose credentials qua `VITE_*`.
- Chưa quyết định (ghi nhận, không tự suy diễn): song ngữ VI/EN có phải cam kết sản phẩm lâu dài hay chỉ tính năng hiện hữu; mô hình kiếm tiền chi tiết quanh VNPay.

## Brand Commitments

- Tên "ComicVerse" là ràng buộc: giữ nguyên trong mọi thiết kế.
- Dark mode và light mode là hai chế độ ngang hàng: mọi thiết kế phải chăm sóc cả hai, không coi một chế độ nào là phụ.

## Evidence on Hand

- Repo: `README.md`, `docs/production-readiness.md`, mã nguồn `Client/src`, `Backend/src`.
- Chưa có: tài liệu marketing, testimonial, số liệu người dùng, bộ nhận diện thương hiệu ngoài tên. Công việc sau này không được bịa các bằng chứng này.

## Product Principles

1. **Nội dung là giao diện** — chrome tối giản; ở reader, không gì đứng giữa người đọc và trang truyện.
2. **Đa nền tảng bình quyền** — desktop để khám phá/quản lý và mobile để đọc đều là trải nghiệm hạng nhất, không co kéo.
3. **Đường tới chương mới ngắn nhất** — từ mở app đến đang đọc ít bước nhất có thể.
4. **Hai theme là một sản phẩm** — mọi thành phần phải hoạt động đẹp ở cả dark và light.
