import { API_BASE_URL } from '../constants/api';
import { clearReadingHistory } from '../utils/readingHistory';

const apiClient = async (endpoint, options = {}) => {
    const { body, ...customConfig } = options;
    const headers = { 'Content-Type': 'application/json', ...customConfig.headers };

    const config = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers,
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
            const token = localStorage.getItem('token');
            const authHeader = config.headers && Object.keys(config.headers).find(key => key.toLowerCase() === 'authorization');
            // Only auto-logout if there IS a token, the request was authenticated,
            // and the response is not a specific "chapter locked" payload.
            if (token && authHeader && !data.is_locked) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                clearReadingHistory();
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
