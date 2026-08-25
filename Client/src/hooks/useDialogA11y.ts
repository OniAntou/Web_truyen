import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Hành vi dialog chuẩn: focus phần tử đầu tiên khi mở, giữ Tab trong dialog,
 * Esc đóng, và trả focus về nơi gọi khi đóng. `onClose` được giữ trong ref
 * nên caller có thể truyền hàm inline mà không làm re-run effect.
 */
export function useDialogA11y<T extends HTMLElement>(open: boolean, onClose: () => void) {
    const ref = useRef<T>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const dialog = ref.current;
        const first = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        first?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab' || !dialog) return;
            const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
                .filter((el) => !el.hasAttribute('disabled'));
            if (items.length === 0) return;
            const firstEl = items[0];
            const lastEl = items[items.length - 1];
            if (event.shiftKey && document.activeElement === firstEl) {
                event.preventDefault();
                lastEl.focus();
            } else if (!event.shiftKey && document.activeElement === lastEl) {
                event.preventDefault();
                firstEl.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            previouslyFocused?.focus();
        };
    }, [open]);

    return ref;
}
