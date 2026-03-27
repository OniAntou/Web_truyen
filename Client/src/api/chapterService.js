import apiClient from './apiClient';

export const chapterService = {
    getPages: (chapterId) => apiClient(`/chapters/${chapterId}/pages`)
};
