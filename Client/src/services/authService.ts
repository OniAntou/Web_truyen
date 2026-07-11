import apiClient from './apiClient';
import { User } from '../types/user';

interface AuthResponse {
    message: string;
    user: User;
}

export const authService = {
    login: (email: string, password: string) => apiClient<AuthResponse>('/auth/login', {
        body: { email, password }
    }),
    register: (username: string, email: string, password: string) => apiClient<AuthResponse>('/auth/register', {
        body: { username, email, password }
    }),
    forgotPassword: (email: string) => apiClient<{ message: string }>('/auth/forgot-password', {
        body: { email }
    }),
    resetPassword: (token: string, password: string) => apiClient<{ message: string }>(`/auth/reset-password/${token}`, {
        body: { password }
    }),
    logout: () => apiClient<{ message: string }>('/auth/logout', { method: 'POST' }),
    adminLogout: () => apiClient<{ message: string }>('/auth/admin/logout', { method: 'POST' }),
};
