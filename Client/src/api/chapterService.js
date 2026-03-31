import { API_BASE_URL } from '../constants/api';

export const chapterService = {
    getPages: async (chapterId) => {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}/pages`, { headers });
        const data = await response.json();
        if (!response.ok) {
            throw data; // throw full object to pass is_locked, price, message
        }
        return data;
    },
    unlockChapter: async (chapterId, token) => {
        const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}/unlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};
