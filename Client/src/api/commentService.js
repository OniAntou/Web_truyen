import apiClient from './apiClient';

export const commentService = {
    getByComic: (comicId, chapterId = null) => {
        const endpoint = `/comics/${comicId}/comments${chapterId ? `?chapterId=${chapterId}` : ''}`;
        return apiClient(endpoint);
    },
    create: (comicId, content, chapterId = null, parentId = null) => apiClient(`/comics/${comicId}/comments`, {
        method: 'POST',
        body: { content, chapterId, parentId }
    }),
    delete: (comicId, commentId) => apiClient(`/comics/${comicId}/comments/${commentId}`, {
        method: 'DELETE'
    })
};
