import { API_BASE_URL } from '../constants/api';

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
