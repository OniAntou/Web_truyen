import { API_BASE_URL } from '../constants/api';
import { clearAuthToken, getAuthToken } from '../utils/authToken';

interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: Record<string, unknown>;
    skipAuthLogout?: boolean;
}

const apiClient = async <T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { body, skipAuthLogout = false, ...customConfig } = options;
    const headers: Record<string, string> = { 
        'X-Requested-With': 'XMLHttpRequest',
        ...((customConfig.headers as Record<string, string>) || {}) 
    };

    const token = endpoint.startsWith('/admin') ? null : getAuthToken();
    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers,
        credentials: 'include',
    };

    const method = (config.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        let data: T & { is_locked?: boolean; message?: string };
        try {
            data = await response.json();
        } catch {
            data = {} as T & { is_locked?: boolean; message?: string };
        }

        // Global handling of expired/invalid tokens.
        if (!skipAuthLogout && (response.status === 401 || (response.status === 403 && data.message?.toLowerCase().includes('token')))) {
            const user = localStorage.getItem('user');
            // Only auto-logout user if there IS a user session and the response is not a specific "chapter locked" payload.
            if (user && !data.is_locked) {
                localStorage.removeItem('user');
                clearAuthToken();
                window.dispatchEvent(new Event('auth:logout'));
            }
        }
        
        if (response.ok) {
            return data as T;
        }
        
        const errorMessage = data.message || 'Something went wrong';
        throw { ...data, message: errorMessage };
    } catch (err: unknown) {
        if (err && typeof err === 'object' && !('name' in err)) {
            return Promise.reject(err);
        }
        const message = err instanceof Error ? err.message : String(err);
        return Promise.reject(message);
    }
};

export default apiClient;
