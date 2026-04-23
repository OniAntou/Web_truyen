import apiClient from './apiClient';

export const authService = {
    login: (email, password) => apiClient('/auth/login', {
        body: { email, password }
    }),
    register: (username, email, password) => apiClient('/auth/register', {
        body: { username, email, password }
    }),
    forgotPassword: (email) => apiClient('/auth/forgot-password', {
        body: { email }
    }),
    resetPassword: (token, password) => apiClient(`/auth/reset-password/${token}`, {
        body: { password }
    }),
    logout: () => apiClient('/auth/logout', { method: 'POST' }),
};
