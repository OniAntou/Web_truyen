import apiClient from './apiClient';

export const authService = {
    login: (email, password) => apiClient('/auth/login', {
        body: { email, password }
    }),
    register: (username, email, password) => apiClient('/auth/register', {
        body: { username, email, password }
    })
};
