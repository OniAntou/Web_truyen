import apiClient from './apiClient';

export const commentService = {
    getByComic: (comicId, chapterId = null) => {
        const endpoint = `/comics/${comicId}/comments${chapterId ? `?chapterId=${chapterId}` : ''}`;
        return apiClient(endpoint);
    },
    create: (comicId, content, chapterId = null, parentId = null, token) => apiClient(`/comics/${comicId}/comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: { content, chapterId, parentId }
    }),
    delete: (comicId, commentId, token) => apiClient(`/comics/${comicId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
};
