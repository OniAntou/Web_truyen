import { API_BASE_URL } from '../constants/api';
import { clearSession } from '../utils/auth';

const apiClient = async (endpoint, options = {}) => {
    const { body, ...customConfig } = options;
    const headers = { 'Content-Type': 'application/json', ...customConfig.headers };

    const config = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers,
        credentials: 'include',
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        // Global handling of expired/invalid tokens
        if (response.status === 401 || response.status === 403) {
            const user = localStorage.getItem('user');
            // Only auto-logout user if there IS a user session and the response is not a specific "chapter locked" payload.
            if (user && !data.is_locked) {
                // We DON'T call clearSession() here because that would also kill admin session.
                // We just clear the user state.
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('auth:logout'));
            }
        }
        
        if (response.ok) {
            return data;
        }
        
        const errorMessage = data.message || 'Something went wrong';
        throw { ...data, message: errorMessage };
    } catch (err) {
        if (err && typeof err === 'object' && !err.name) {
            return Promise.reject(err);
        }
        return Promise.reject(err?.message || err);
    }
};

export default apiClient;
