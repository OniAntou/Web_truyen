import { useEffect, useState } from 'react';

/**
 * Ẩn chrome khi người dùng cuộn xuống (đang đọc), hiện lại khi cuộn lên
 * hoặc ở gần đầu trang. Trả về true = nên ẩn.
 */
export function useAutoHideOnScroll(threshold = 80): boolean {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        let lastY = window.scrollY;
        let raf = 0;

        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const y = window.scrollY;
                const delta = y - lastY;
                lastY = y;
                if (y < threshold) setHidden(false);
                else if (delta > 6) setHidden(true);
                else if (delta < -6) setHidden(false);
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [threshold]);

    return hidden;
}
