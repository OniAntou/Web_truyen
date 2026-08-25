---
target: trang đọc truyện (ReadPage + features/reader)
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-25T17-04-33Z
slug: client-src-pages-comic-readpage-tsx
---
Method: dual-agent (A: CritiqueA · B: CritiqueB)

# Critique — Trang đọc truyện ComicVerse (`/read/:slugAndId/:chapterId`)

Target: `Client/src/pages/comic/ReadPage.tsx` + `features/reader/*` + layouts liên quan. Mode surface: **Operate**. Giới hạn môi trường: backend không chạy local nên inspection trực quan thấy layout chrome + loading/error states; phần data-dependent đánh giá qua code.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Không có vị trí trong chapter (trang X/Y); skeleton + prefetch tốt (`ReadPage.tsx:128-136`) |
| 2 | Match System / Real World | 2 | Trộn ngữ: "Previous/Next/Comic Info" tiếng Anh giữa UI Việt (`ReaderFooterSection.tsx:33-44`) |
| 3 | User Control and Freedom | 1 | Confirm modal chỉ đóng bằng nút X — không Escape/backdrop/focus return (`ReaderModals.tsx:40-73`); ảnh lỗi không retry |
| 4 | Consistency and Standards | 1 | Reader hardcode `text-white`/`bg-zinc` thay token → vỡ light mode (`ReaderControls.tsx:80,106`) |
| 5 | Error Prevention | 2 | Có confirm trước tiêu Xu + disable khi processing (`ReaderModals.tsx:60-70`); không check số dư trước |
| 6 | Recognition Rather Than Recall | 2 | Số dư Xu không bao giờ hiển thị tại điểm chi |
| 7 | Flexibility and Efficiency | 1 | Zero accelerator: không phím mũi tên, tap-zone, auto-hide chrome cho hành động lặp nhất |
| 8 | Aesthetic and Minimalist Design | 2 | Canvas đọc sạch là điểm mạnh nhưng pill đè mép dưới artwork + navbar pin desktop + nút nổi mobile |
| 9 | Error Recovery | 0 | "Error: Something went wrong" đỏ trần không action (`ReadPage.tsx:220`); "Content not found" màu trắng vô hình trên light (`ReadPage.tsx:221`); ảnh lỗi không retry (`LazyImage.tsx:96-100`) |
| 10 | Help and Documentation | 1 | Paywall dùng "Xu"/"VIP" không giải thích; không help contextual trong reader |
| **Total** | | **15/40** | **Poor — major overhaul cần trước khi người dùng hài lòng** |

## Design Specificity Verdict

**LLM assessment:** Category-interchangeable, brand tint nhẹ (~4/10). Bỏ logo ra, đây là bất kỳ webcomic reader nào: canvas dọc nền đen 800px (`index.css:1372-1377`) + pill nổi 3 nút (`ReaderControls.tsx:68-94`) — pattern mặc định thể loại. Rose `#f43f5e` chỉ ở nút Next + logo; typography Outfit không tạo dấu hiệu riêng trong reader. Nhãn trộn tiếng Anh làm mất giọng sản phẩm. Điểm authored duy nhất hiện tại: thẻ paywall vàng Xu/VIP (`LockedChapterView.tsx:41-72`). Tuyên ngôn "nơi đọc không nhiễu" (PRODUCT.md) có thể thành bản sắc thật — nhưng đang bị chính chrome của product phá.

**Deterministic scan (detect.mjs, exit 2):** 2 findings `gray-on-color`: `ReaderHeader.tsx:35` (`text-zinc-500` trên `bg-rose-500`, đúng trong surface) và `AdminLayout.tsx:119` (ngoài surface đọc — hit do đường scan chứa `layouts/`, không tính lỗi reader).

**Browser evidence (inject thành công, tab công cụ — không có overlay hiển thị cho người dùng):** Homepage + reader error-state đo được: low-contrast 3.7:1 chữ trắng trên rose (link/button); text chức năng 10.4px "Creator"; body text uppercase 39 ký tự; gradient-text (`background-clip:text`); marquee shimmer vô hạn ×2 (`.shimmer`, `.lazy-image-skeleton`); dark-glow box-shadow `#0ea5e9`; `transition: width`; toàn trang chỉ 1 font (Outfit); palette tím/violet đặc trưng AI-default. Detector bắt đúng họ "slop tĩnh" mà review LLM xếp vào category-interchangeable — hai assessment hội tụ.

## Overall Impression

Khung đọc dọc nền tối đúng hẹn "đọc sạch", prefetch + LazyImage chống layout shift cho thấy nền kỹ thuật tốt. Nhưng trải nghiệm bị kéo xuống bởi ba lớp lỗi cộng dồn: (1) trạng thái thất bại bị bỏ rơi hoàn toàn (error recovery 0/4), (2) light mode vỡ ngay tại control chính vì component chạm nhiều nhất của product đi vòng qua design token, (3) fixed chrome vĩnh viễn đè lên artwork trái ngược chính tuyên ngôn sản phẩm. Cơ hội lớn nhất: biến "đọc sạch" từ khẩu hiệu thành cơ chế — auto-hide chrome, resume position, peak-end khi hết chương.

## What's Working

1. **Progressive disclosure control đọc** — pill 3 nút + chapter list on-demand, auto-scroll tới chapter hiện tại + chấm đã-đọc (`ReaderControls.tsx:60-64,120-144`).
2. **Đường tới chương mới ngắn** — prefetch next chapter (`ReadPage.tsx:128-136`), LazyImage aspect-ratio chống CLS (`LazyImage.tsx:71-84`), Next là primary action ở end-of-chapter.
3. **MobileMenu IA đúng chuẩn** — 3 nhóm nhãn, `inert`/`aria-modal`/`aria-expanded` đầy đủ (`MobileMenu.tsx:49-57,83-141`).

## Priority Issues

### [P0] Error states dead-end, một state còn vô hình
- **What:** Lỗi query render chữ đỏ trần không có hành động nào (`ReadPage.tsx:220`); "Content not found" `color:'white'` — vô hình trên light mode (`ReadPage.tsx:221`); ảnh chương lỗi không có retry từng trang (`LazyImage.tsx:96-100`); copy hứa "Hệ thống sẽ tự động tải lại trang" nhưng không có gì reload (`ReadPage.tsx:181`).
- **Why it matters:** Mạng/backend lỗi là trạng thái tất yếu của web đọc truyện; đây là nơi mất niềm tin nhanh nhất. Heuristic 9 = 0/4. Riley gặp ngay ở lần test đầu.
- **Fix:** Error component theo token với 3 lối thoát (Thử lại / Về truyện / Trang chủ); sửa `var(--text-primary)`; retry button vào LazyImage; bỏ lời hứa reload hoặc hiện thực nó.
- **Suggested command:** `/impeccable harden`

### [P0] Light mode vỡ tại control chính — đi vòng qua design token
- **What:** Pill "Chapter 1" `text-white` trên nền sáng ~1.6:1 (`ReaderControls.tsx:80`); tiêu đề modal trắng trên panel sáng (`ReaderControls.tsx:106`); payment modals `bg-zinc-950` cứng trong light (`ReaderModals.tsx:42,78`); class nội suy `text-${...}` không sinh CSS (`LockedChapterView.tsx:61`). Detector đo thêm: skip-link trắng/rose 3.7:1, đỏ `#ff0000` trên zinc-900 chỉ 4.4:1.
- **Why it matters:** PRODUCT.md cam kết "hai theme là một sản phẩm". Người dùng light mode (một nửa đối tượng "đa nền tảng") nhận UI hỏng ở đúng chỗ chạm nhiều nhất.
- **Fix:** Thay mọi hardcode white/zinc trong `features/reader/*` bằng `--text-*/--bg-*/--border`; cấm class nội suy Tailwind; audit cả hai theme.
- **Suggested command:** `/impeccable polish`

### [P1] Không resume position — progress còn tự reset về trang 1
- **What:** Mount luôn `scrollTo(0,0)` (`ReadPage.tsx:68-70`) và `updateReadingProgress(1)` ngay khi load (`ReadPage.tsx:92-104`), dù `getReadingProgress` đã tồn tại nhưng không được gọi.
- **Why it matters:** JTBD cốt lõi của độc giả mobile là đọc nhanh mọi lúc; gián đoạn là bình thường. Mỗi lần quay lại phải tự tìm lại chỗ đang đọc — Casey mất tiến trình sau mỗi lần chuyển app.
- **Fix:** Restore trang đã lưu khi mount; chỉ cập nhật tiến trình hướng tới trước (không bao giờ lùi).
- **Suggested command:** `/impeccable harden`

### [P1] Fixed chrome đè artwork vĩnh viễn
- **What:** Pill điều khiển đè mép dưới mọi scroll position; navbar pin desktop; 2 nút nổi trên ảnh mobile; `.reader-controls-fixed` không dùng `--safe-area-bottom` dù đã định nghĩa (`index.css:24` vs `3835-3838`) — dính home indicator iOS.
- **Why it matters:** Trái nguyên tắc số 1 trong PRODUCT.md: "ở reader, không gì đứng giữa người đọc và trang truyện".
- **Fix:** Auto-hide chrome khi scroll xuống, hiện khi scroll lên/tap; cân nhắc navbar reader tối giản (back + title + menu) thay navbar marketing đầy đủ; áp safe-area.
- **Suggested command:** `/impeccable distill`

### [P2] Khoảnh khắc thanh toán thiếu ngữ cảnh và dễ gãy
- **What:** Không hiện balance tại điểm chi tiêu; CTA "Nạp Xu Ngay" được chọn bằng string-match tiếng Việt `message.includes("không đủ")` (`ReaderModals.tsx:98,108`); nhãn "Đang tải lại..." nhưng không reload gì; giá VIP hardcode 2 chỗ (`ReadPage.tsx:165`, `LockedChapterView.tsx:70`).
- **Why it matters:** Đây là điểm stress cao nhất + conversion cao nhất của reader. String-match gãy im lặng khi đổi copy hoặc bật i18n.
- **Fix:** Hiện balance trong confirm modal; phân loại lỗi theo code/kiểu thay vì message; 1 nguồn hằng giá; token hóa modal.
- **Suggested command:** `/impeccable harden`

**Phát hiện ngoài phạm vi surface (ghi nhận cho lần sau):** Homepage mang cả họ tín hiệu slop tĩnh detector bắt được — gradient-text, marquee shimmer vô hạn, dark-glow, purple/violet AI-palette, text 10.4px, body uppercase — thuộc surface marketing, không phải reader; xử lý riêng bằng `/impeccable quieter` + `/impeccable typeset` nếu muốn.

## Persona Red Flags

**Sam (accessibility):**
- Modals thiếu `role="dialog"`/`aria-modal`/focus trap/Escape/return-focus (`ReaderControls.tsx:96-152`; `ReaderModals.tsx:40-112`).
- Nút X icon-only không `aria-label` (`ReaderModals.tsx:43-48,79-84`; `ReaderControls.tsx:107-112`).
- Contrast fail: pill trắng/trên sáng ~1.6:1; "Theo Dõi" `#eab308` trên nền sáng ~1.9:1 (`Navbar.tsx:48`); skip-link 3.7:1 (detector đo).
- Zero phím tắt; `prefers-reduced-motion` chỉ xử lý 1 class (`index.css:4450-4453`).

**Casey (mobile one-handed):**
- `--safe-area-bottom` không được dùng ở reader controls — dính home indicator.
- Nút search/menu pin top-right (vùng tệ nhất one-handed) đè artwork.
- Gián đoạn = mất chỗ đọc + progress reset (P1 resume).
- End-buttons mobile font 0.75rem — tap target nhỏ (`index.css:1487-1493`).

**Riley (stress tester):**
- Refresh giữa chương → về đầu, mất chỗ (`ReadPage.tsx:68-70`).
- Lỗi mạng → dead-end đỏ không retry.
- Chapter dài → không page counter/jump-to-page.
- "Content not found" trắng trên light — state tồn tại nhưng không nhìn thấy được.
- Copy hứa auto-reload nhưng không reload.

## Minor Observations

- `og:title` dính literal `{chapter.title}` (`ReadPage.tsx:231`).
- `.reader-page` dùng ở `ReadPage.tsx:197,226` nhưng không có CSS rule — dead class.
- Toàn bộ `animate-in`/`fade-in`/`zoom-in-95` là dead class: không có `tailwindcss-animate` (`tailwind.config.js:10` plugins rỗng) → modals không có animation.
- Hover lift trên pill dock (`index.css:1527-1529`).
- Navbar desktop logged-in 1440px: labels wrap 2 dòng.
- Theme mặc định dark, không tôn trọng `prefers-color-scheme` (`themeStore.ts:16`).
- Label theme trong drawer hiển thị trạng thái hiện tại chứ không phải đích (`MobileMenu.tsx:126`).
- Title tooltip tiếng Anh trên control-btn (`ReaderControls.tsx:73,89`).
- CSS `.reader-end-badge`/`.reader-end-title` tồn tại (`index.css:1398-1417`) nhưng không component nào dùng — khoảnh khắc kết thúc chương đang bị bỏ hoang.

## Questions to Consider

1. ClientLayout đã có sẵn cơ chế ẩn navbar cho `/read/` (`ClientLayout.tsx:12,20`) — ReadPage gắn lại navbar đầy đủ. Tầng nào đang nói dối intent?
2. Nếu pill hiển thị "Trang 3/24" thay vì "Chapter 1", system status có tốt hơn mà không thêm pixel chrome nào không?
3. Paywall đang bán một ổ khóa — có nên bán một đoạn xem trước (số trang, 1 trang mẫu)?
4. Design system đã có token cho cả 2 theme — tại sao component chạm nhiều nhất của reader lại đi vòng qua token?
5. Nếu peak-end là luật, khoảnh khắc đáng nhớ nhất của một phiên đọc ComicVerse hôm nay là gì — có phải chính là màn hình lỗi đỏ?
