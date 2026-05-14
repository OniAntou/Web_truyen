import apiClient from './apiClient';

export const chapterService = {
    getPages: (chapterId: string) => apiClient<any>(`/chapters/${chapterId}/pages`, {
        skipAuthLogout: true
    }),
    unlockChapter: (chapterId: string) => apiClient<any>(`/chapters/${chapterId}/unlock`, {
        method: 'POST'
    })
};
