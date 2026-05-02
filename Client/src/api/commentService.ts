import apiClient from './apiClient';

export const commentService = {
    getByComic: (comicId: string, chapterId: string | null = null) => {
        const endpoint = `/comics/${comicId}/comments${chapterId ? `?chapterId=${chapterId}` : ''}`;
        return apiClient<any>(endpoint);
    },
    create: (comicId: string, content: string, chapterId: string | null = null, parentId: string | null = null) => apiClient<{ message: string }>(`/comics/${comicId}/comments`, {
        method: 'POST',
        body: { content, chapterId, parentId }
    }),
    delete: (comicId: string, commentId: string) => apiClient<{ message: string }>(`/comics/${comicId}/comments/${commentId}`, {
        method: 'DELETE'
    })
};
