const STORAGE_KEY = 'comicverse_reading_history';
const MAX_HISTORY = 20;

/**
 * Lấy lịch sử đọc truyện từ LocalStorage.
 * @returns {Array} Danh sách truyện đã đọc gần đây (mới nhất trước).
 */
export const getReadingHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

/**
 * Lưu 1 entry vào lịch sử đọc.
 * @param {Object} entry - { comicId, comicTitle, coverUrl, chapterId, chapterTitle, chapterNumber }
 */
export const saveReadingHistory = (entry) => {
    try {
        let history = getReadingHistory();

        // Xóa entry cũ cùng comicId (nếu có)
        history = history.filter(item => item.comicId !== entry.comicId);

        // Thêm vào đầu danh sách
        history.unshift({
            ...entry,
            timestamp: Date.now()
        });

        // Giới hạn số lượng
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
        console.error('Error saving reading history:', err);
    }
};

/**
 * Xóa toàn bộ lịch sử đọc truyện.
 */
export const clearReadingHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};
