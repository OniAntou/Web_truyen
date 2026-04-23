import { API_BASE_URL } from '../constants/api';

export const chapterService = {
    getPages: async (chapterId) => {
        const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}/pages`, { 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw data; // throw full object to pass is_locked, price, message
        }
        return data;
    },
    unlockChapter: async (chapterId) => {
        const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}/unlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};
