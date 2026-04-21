import apiClient from './apiClient';

export const userService = {
    getMe: (token) => apiClient('/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    }),
    deleteAccount: (token) => apiClient('/users/me', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
};
