import apiClient from './apiClient';

import { User } from '../types/user';

export const userService = {
    getMe: () => apiClient<User>('/users/me'),
    deleteAccount: () => apiClient<{ message: string }>('/users/me', {
        method: 'DELETE'
    })
};
