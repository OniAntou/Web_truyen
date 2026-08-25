---
target: trang đọc truyện (ReadPage + features/reader)
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-25T17-44-29Z
slug: client-src-pages-comic-readpage-tsx
---
Method: dual-agent (A: CritiqueA2 · B: CritiqueB2)

# Critique lần 2 — Trang đọc truyện ComicVerse (sau khi sửa theo backlog lần 1)

Target: `Client/src/pages/comic/ReadPage.tsx` + `features/reader/*` + `useAutoHideOnScroll` + `pricing.ts` + reader CSS. Mode: **Operate**. Giới hạn: backend tắt → canvas/pill/locked đánh giá qua code [CODE]; error state soi live cả 2 theme + mobile 375px + keyboard.

## Design Health Score

| # | Heuristic | L1 | L2 | Key Issue còn lại |
|---|-----------|----|----|-------------------|
| 1 | Visibility of System Status | 2 | 3 | Resume nhảy im lặng, không "tiếp tục từ trang X"; pill chưa có vị trí trang |
| 2 | Match System / Real World | 2 | 3 | Raw English "Something went wrong" leak vào UI Việt tại màn lỗi (`ReadPage.tsx:286`) |
| 3 | User Control and Freedom | 1 | 2 | 3 modal vẫn không Escape/focus-trap/focus-return; confirm không backdrop-close |
| 4 | Consistency and Standards | 1 | 3 | Nhóm màu tiền/status (yellow/green/red) đi vòng qua token; giá vàng 1.57:1 trên light |
| 5 | Error Prevention | 2 | 3 | Pre-check số dư + typed topup action đã vào; disable khi processing |
| 6 | Recognition Rather Than Recall | 2 | 3 | Balance tại điểm chi; chấm đã-đọc + auto-scroll chapter list |
| 7 | Flexibility and Efficiency | 1 | 2 | Prefetch + resume forward-only; chưa có phím mũi tên/tap-zone/Esc |
| 8 | Aesthetic and Minimalist Design | 2 | 3 | Chrome reader tối giản thật (navbar off, pill auto-hide); nav labels wrap 2 dòng @1440px |
| 9 | Error Recovery | 0 | 3 | ReaderErrorState role=alert, 2 lối thoát, token sạch 2 theme; thiếu exit về trang truyện |
| 10 | Help and Documentation | 1 | 2 | VIP có 1 dòng lợi ích; "Xu" vẫn jargon chưa giải thích |
| **Total** | | **15/40** | **27/40** | **Acceptable (cận trên) — từ Poor** |

## Design Specificity Verdict

**6/10 — hết slop, còn genre-default** (L1: ~4/10). Live đo: gradient-text 0, shimmer 0, violet layers/glow đã bỏ. "Nơi đọc không nhiễu" lần đầu là cơ chế: navbar off tại `/read/`, auto-hide pill có dead-band ±6px, safe-area iOS. Bản sắc còn mỏng: accent rose + thẻ paywall vàng; slot đắt nhất (end-of-chapter) vẫn 3 nút generic, `.reader-end-badge/.reader-end-title` vẫn orphan.

**Deterministic scan (B2):** CLI 1 hit duy nhất — `AdminLayout.tsx:119` `gray-on-color`, đánh dấu **false positive** (gray nằm trên hover tint 10% opacity, không bao giờ trên đỏ đặc; hover chuyển text đỏ). Browser residual: single-font Outfit (lựa chọn brand — intentional), `.lazy-image-skeleton` shimmer (functional loading feedback — intentional exception), dark-glow `#e11d48` (bóng rose nhỏ), flat-type-hierarchy trên error page (14.4/16/20px).

## What Improved (15 → 27)

- **P0 error states** → ReaderErrorState `role=alert` + Thử lại/Về trang chủ, retry từng trang ảnh, bỏ fake auto-reload. Heuristic 9: 0→3.
- **P0 light mode vỡ** → token hóa `features/reader/*`, pill/modal/locked đọc được cả 2 theme (verify live). Heuristic 4: 1→3.
- **P1 resume** → restore vị trí đọc đúng chapter, forward-only save. Casey thắng lớn nhất.
- **P1 fixed chrome** → navbar rời reader, pill auto-hide, safe-area. Heuristic 8: 2→3.
- **P2 payment** → 1 nguồn giá `pricing.ts`, pre-check balance, typed action thay string-match, balance trong confirm.
- **Homepage slop** → gradient-text/shimmer-dead/violet/glow/10.4px chip/footer uppercase đã sạch (detector xác nhận).

## Remaining Priority Issues (0×P0, 3×P1, 2×P2)

### [P1] Raw error message tiếng Anh leak vào UI Việt
`ReadPage.tsx:286` + `:248-249` render `error.message` nguyên văn. Map error type → copy tiếng Việt tại boundary; phân biệt mạng/server/nội dung. → `/impeccable clarify`

### [P1] Modals thù địch với keyboard
Cả 3 modal zero `keydown`: không Esc, không focus trap, không focus return; confirm không backdrop-close. → `/impeccable harden`

### [P1] Màu tiền/status ngoài hệ token
`text-yellow-500` giá Xu **1.57:1** trên light (`ReaderModals.tsx:73`); badge vàng **1.92:1** (`LockedChapterView.tsx:41`); success green **2.28:1**. Thêm `--warning/--success/--danger` theo theme. → `/impeccable polish`

### [P2] Peak-end bỏ hoang + không vị trí trang
`.reader-end-badge` orphan; pill chưa "Chapter N · Trang X/Y" (data đã có). → `/impeccable delight`

### [P2] Round-trip nạp Xu mất ngữ cảnh; homepage im lặng khi API chết
"Nạp Xu Ngay" rời reader không đường về; homepage không có error state khi data fail. → `/impeccable harden`

## Persona Red Flags (tóm tắt)

- **Sam:** modal keyboard (P1); vàng 1.57:1/1.92:1; `--text-secondary` light 3.95:1 ở 14px; `prefers-reduced-motion` chỉ cover 1 class. Tốt: focus ring thấy, aria-label đủ, role=alert đúng.
- **Casey:** resume + pill thumb-zone + safe-area ✅; nạp Xu mất chapter; end-buttons 0.75rem còn nhỏ.
- **Riley:** retry trung thực, refresh giữ tiến độ ✅; "Something went wrong" không chẩn đoán; chapter 0 trang không có action; homepage API-chết im lặng.

## Minor Observations

Nav labels wrap @1440px · Footer có ở locked branch nhưng thiếu ở error branch · `.reader-page` dead class · `hover:bg-white/10` vô hình light · hover "Báo lỗi" bằng JS thiếu parity focus · chip Creator vẫn uppercase 12px · resume nhảy im lặng.

## Questions to Consider

1. Pill đã biết tổng trang — sao không "Chapter 12 · Trang 8/24"? Một string, 0 pixel mới.
2. Hết chương là khoảnh khắc attention cao nhất — xứng đáng hơn 3 nút generic?
3. Cái gì bảo đảm user tìm lại chapter vừa khóa sau khi nạp Xu?
4. Màu tiền tại sao sống ngoài token trong khi mọi màu khác tuân?
5. "Nơi đọc không nhiễu" nên nói gì khi chính đang nhiễu (API chập chờn)?
