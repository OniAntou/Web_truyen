import apiClient from './apiClient';

export const userService = {
    getMe: () => apiClient('/users/me'),
    deleteAccount: () => apiClient('/users/me', {
        method: 'DELETE'
    })
};
