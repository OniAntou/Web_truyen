import apiClient from './apiClient';

export const comicService = {
    getAll: (query = '', genre = '') => {
        let endpoint = '/comics';
        const params = [];
        if (query) params.push(`q=${encodeURIComponent(query)}`);
        if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
        
        if (params.length > 0) {
            endpoint += `?${params.join('&')}`;
        }
        return apiClient(endpoint);
    },
    getTrending: (limit = 10) => apiClient(`/comics/trending?limit=${limit}`),
    getHomeData: (version) => apiClient(`/comics/home${version ? `?v=${version}` : ''}`),
    getById: (id) => {
        return apiClient(`/comics/${id}`);
    },
    getUserRating: (id) => apiClient(`/comics/${id}/user-rating`),
    getFavoriteStatus: (id) => apiClient(`/comics/${id}/favorite`),
    getReadingProgress: (id) => apiClient(`/comics/${id}/reading-progress`),
    rate: (id, rating) => apiClient(`/comics/${id}/rate`, {
        method: 'POST',
        body: { rating }
    }),
    toggleFavorite: (id) => apiClient(`/comics/${id}/favorite`, {
        method: 'POST'
    }),
    getChaptersReadStatus: (id) => apiClient(`/comics/${id}/chapters/read-status`),
    getPopular: (sortBy = 'views', limit = 12, genre = '') => {
        let endpoint = `/comics/popular?sort=${sortBy}&limit=${limit}`;
        if (genre) endpoint += `&genre=${encodeURIComponent(genre)}`;
        return apiClient(endpoint);
    },
    getLatest: (page = 1, limit = 18, genre = '') => {
        let endpoint = `/comics/latest?page=${page}&limit=${limit}`;
        if (genre) endpoint += `&genre=${encodeURIComponent(genre)}`;
        return apiClient(endpoint);
    },
    getGenres: () => apiClient('/genres'),
    updateView: (id) => apiClient(`/comics/${id}/view`, {
        method: 'POST'
    }),
    updateReadingProgress: (id, chapterId, pageNum) => apiClient(`/comics/${id}/reading-progress`, {
        method: 'POST',
        body: {
            chapter_id: chapterId,
            page_number: pageNum
        }
    }),
    getReaderData: (id, chapterId) => {
        return apiClient(`/comics/${id}/reader/${chapterId}`);
    },
    getUserReadingHistory: () => apiClient('/users/reading-progress'),
    testConnection: () => apiClient('/test'),
    warmup: () => apiClient('/health').catch(() => {}) // Lightweight ping to wake up server
};
