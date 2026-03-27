import apiClient from './apiClient';

export const userService = {
    deleteAccount: (token) => apiClient('/users/me', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
};
