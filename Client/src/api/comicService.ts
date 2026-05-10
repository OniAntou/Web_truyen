import apiClient from './apiClient';
import { Comic, Genre, Pagination, ReadingProgress } from '../types/comic';

export interface ComicsResponse {
    comics: Comic[];
    genres?: (Genre | string)[];
    pagination?: Pagination;
}

export const comicService = {
    getAll: (query: string = '', genre: string = '') => {
        let endpoint = '/comics';
        const params = [];
        if (query) params.push(`q=${encodeURIComponent(query)}`);
        if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
        
        if (params.length > 0) {
            endpoint += `?${params.join('&')}`;
        }
        return apiClient<ComicsResponse>(endpoint);
    },
    getTrending: (limit: number = 10) => apiClient<Comic[]>(`/comics/trending?limit=${limit}`),
    getHomeData: (version?: string) => apiClient<{ popular?: Comic[]; latest?: Comic[]; trending?: Comic[] }>(`/comics/home${version ? `?v=${version}` : ''}`),
    getById: (id: string) => {
        return apiClient<Comic>(`/comics/${id}`);
    },
    getUserRating: (id: string) => apiClient<{ rating: number }>(`/comics/${id}/user-rating`, { skipAuthLogout: true }),
    getFavoriteStatus: (id: string) => apiClient<{ isFavorited: boolean }>(`/comics/${id}/favorite`, { skipAuthLogout: true }),
    getReadingProgress: (id: string) => apiClient<ReadingProgress>(`/comics/${id}/reading-progress`, { skipAuthLogout: true }),
    rate: (id: string, rating: number) => apiClient<{ user_rating: number, rating: number }>(`/comics/${id}/rate`, {
        method: 'POST',
        body: { rating }
    }),
    toggleFavorite: (id: string) => apiClient<{ isFavorited: boolean }>(`/comics/${id}/favorite`, {
        method: 'POST'
    }),
    getChaptersReadStatus: (id: string) => apiClient<any[]>(`/comics/${id}/chapters/read-status`),
    getUserFavorites: () => apiClient<Comic[]>('/users/favorites'),
    getPopular: (sortBy: string = 'views', limit: number = 12, genre: string = '') => {
        let endpoint = `/comics/popular?sort=${sortBy}&limit=${limit}`;
        if (genre) endpoint += `&genre=${encodeURIComponent(genre)}`;
        return apiClient<ComicsResponse>(endpoint);
    },
    getLatest: (page: number = 1, limit: number = 18, genre: string = '') => {
        let endpoint = `/comics/latest?page=${page}&limit=${limit}`;
        if (genre) endpoint += `&genre=${encodeURIComponent(genre)}`;
        return apiClient<ComicsResponse>(endpoint);
    },
    getGenres: () => apiClient<{ genres: Genre[]; comics: Comic[] }>('/genres'),
    updateView: (id: string) => apiClient<{ success: boolean }>(`/comics/${id}/view`, {
        method: 'POST'
    }),
    updateReadingProgress: (id: string, chapterId: string, pageNum: number) => apiClient<{ success: boolean }>(`/comics/${id}/reading-progress`, {
        method: 'POST',
        body: {
            chapter_id: chapterId,
            page_number: pageNum
        }
    }),
    getReaderData: (id: string, chapterId: string) => {
        return apiClient<any>(`/comics/${id}/reader/${chapterId}`); // Typed correctly in ReadPage
    },
    getUserReadingHistory: () => apiClient<any[]>('/users/reading-progress'),
    testConnection: () => apiClient<{ status: string }>('/test'),
    warmup: () => apiClient<{ status: string }>('/health').catch(() => {}) // Lightweight ping to wake up server
};
