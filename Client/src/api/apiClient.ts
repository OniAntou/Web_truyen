import { API_BASE_URL } from '../constants/api';

interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: Record<string, unknown>;
}

const apiClient = async <T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { body, ...customConfig } = options;
    const headers: HeadersInit = { ...customConfig.headers };

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
