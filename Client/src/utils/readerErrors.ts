/**
 * Quy doi loi tu service layer sang copy tieng Viet cho reader.
 * Tuyet doi khong render Error.message tieng Anh cho nguoi dung.
 */

export interface ReaderErrorInfo {
    title: string;
    message: string;
}

const NETWORK_HINTS = [
    'failed to fetch',
    'fetch failed',
    'networkerror',
    'network request failed',
    'load failed'
];

function readField(err: unknown, field: string): string {
    if (err && typeof err === 'object' && field in err) {
        const value = (err as Record<string, unknown>)[field];
        return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
    }
    return '';
}

/** Message backend có phải tiếng Việt (miền Unicode Latin mở rộng) không. */
function isVietnamese(text: string): boolean {
    return /[\u00C0-\u1EF9]/i.test(text);
}

export function describeReaderError(err: unknown): ReaderErrorInfo {
    const status = Number(readField(err, 'status')) || 0;
    const raw = readField(err, 'message');

    if (status === 404 || /not found|không tồn tại/i.test(raw)) {
        return {
            title: 'Không tìm thấy nội dung',
            message: 'Chapter hoặc truyện có thể đã bị xoá hoặc đường dẫn không đúng.'
        };
    }
    if (status === 401 || status === 403) {
        return {
            title: 'Không có quyền truy cập',
            message: 'Phiên đăng nhập có thể đã hết. Vui lòng đăng nhập lại rồi thử lại.'
        };
    }
    if (NETWORK_HINTS.some((hint) => raw.toLowerCase().includes(hint))) {
        return {
            title: 'Mất kết nối',
            message: 'Không tải được dữ liệu từ máy chủ. Kiểm tra mạng rồi thử lại nhé.'
        };
    }
    if (status === 429 || status >= 500) {
        return {
            title: 'Máy chủ đang bận',
            message: 'Phía máy chủ gặp sự cố hoặc đang quá tải. Vui lòng thử lại sau ít phút.'
        };
    }
    // Backend trả message tiếng Việt (vd: lỗi nghiệp vụ) → dùng nguyên văn.
    if (raw && isVietnamese(raw)) {
        return { title: 'Không tải được chương', message: raw };
    }
    return {
        title: 'Không tải được chương',
        message: 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại hoặc quay lại sau.'
    };
}

/** Message an toàn cho alert giao dịch: chỉ tin message backend tiếng Việt. */
export function describePaymentError(err: unknown): string {
    const raw = readField(err, 'message');
    if (raw && isVietnamese(raw)) return raw;
    return 'Giao dịch không thành công. Vui lòng thử lại sau ít phút.';
}
