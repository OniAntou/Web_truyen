import apiClient from './apiClient';

import { User } from '../types/user';

export const userService = {
    getMe: <T = User>() => apiClient<T>('/users/me'),
    updateMe: <T = User>(updates: Record<string, unknown>) => apiClient<T>('/users/me', {
        method: 'PUT',
        body: updates
    }),
    deleteAccount: () => apiClient<{ message: string }>('/users/me', {
        method: 'DELETE'
    }),
    getTransactions: <T = unknown>() => apiClient<T>('/users/transactions'),
    upgradeVip: <T = { message: string }>() => apiClient<T>('/users/upgrade-vip', {
        method: 'POST'
    }),
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return apiClient<{ user: User; avatar_url: string }>('/upload/avatar', {
            method: 'POST',
            body: formData
        });
    }
};
