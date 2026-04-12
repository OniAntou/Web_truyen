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

        // Global handling of expired/invalid tokens
        if (response.status === 401 || response.status === 403) {
            const token = localStorage.getItem('token');
            const authHeader = config.headers && Object.keys(config.headers).find(key => key.toLowerCase() === 'authorization');
            // Only auto-logout if there IS a token (meaning it's expired/invalid)
            // and the request was authenticated (had Authorization header)
            if (token && authHeader) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                clearReadingHistory();
                // Dispatch a custom event so Navbar and other components can react
                window.dispatchEvent(new Event('auth:logout'));
            }
        }

        const data = await response.json();
        
        if (response.ok) {
            return data;
        }
        
        throw new Error(data.message || 'Something went wrong');
    } catch (err) {
        return Promise.reject(err.message || err);
    }
};

export default apiClient;
