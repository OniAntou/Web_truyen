import apiClient from './apiClient';

export const comicService = {
    getAll: (query = '') => {
        const endpoint = query ? `/comics?q=${encodeURIComponent(query)}` : '/comics';
        return apiClient(endpoint);
    },
    getTrending: (limit = 10) => apiClient(`/comics/trending?limit=${limit}`),
    getById: (id) => apiClient(`/comics/${id}`),
    getUserRating: (id, token) => apiClient(`/comics/${id}/user-rating`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }),
    getFavoriteStatus: (id, token) => apiClient(`/comics/${id}/favorite`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }),
    getReadingProgress: (id, token) => apiClient(`/comics/${id}/reading-progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }),
    rate: (id, rating, token) => apiClient(`/comics/${id}/rate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: { rating }
    }),
    toggleFavorite: (id, token) => apiClient(`/comics/${id}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    }),
    getChaptersReadStatus: (id, token) => apiClient(`/comics/${id}/chapters/read-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }),
    getPopular: (sortBy = 'views', genre = '') => {
        let endpoint = `/comics/popular?sort=${sortBy}`;
        if (genre) endpoint += `&genre=${encodeURIComponent(genre)}`;
        return apiClient(endpoint);
    },
    getLatest: (page = 1, limit = 18, genre = '') => {
        let endpoint = `/comics/latest?page=${page}&limit=${limit}`;
        if (genre) endpoint += `&genre=${encodeURIComponent(genre)}`;
        return apiClient(endpoint);
    },
    getGenres: () => apiClient('/genres'),
    updateView: (id, token) => apiClient(`/comics/${id}/view`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    }),
    updateReadingProgress: (id, chapterId, pageNum, token) => apiClient(`/comics/${id}/reading-progress`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: {
            chapter_id: chapterId,
            page_number: pageNum
        }
    }),
    testConnection: () => apiClient('/test')
};
