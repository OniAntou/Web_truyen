import { API_BASE_URL } from '../constants/api';
import { clearAuthToken, getAuthToken, getAdminToken, clearAdminToken } from '../utils/authToken';

interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: Record<string, any> | FormData;
    skipAuthLogout?: boolean;
}

const apiClient = async <T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { body, skipAuthLogout = false, ...customConfig } = options;
    const headers: Record<string, string> = { 
        'X-Requested-With': 'XMLHttpRequest',
        ...((customConfig.headers as Record<string, string>) || {}) 
    };
    const isAdminContext = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/studio');
    const isExplicitAdminEndpoint = endpoint.startsWith('/admin') || endpoint.startsWith('admin') || endpoint.startsWith('/studio') || endpoint.startsWith('studio');
    
    const isAdmin = isAdminContext || isExplicitAdminEndpoint;
    const token = isAdmin ? (getAdminToken() || getAuthToken()) : getAuthToken();
    
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
    if (['POST', 'PUT', 'PATCH'].includes(method) && !(body instanceof FormData)) {
        (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (body) {
        config.body = body instanceof FormData ? body : JSON.stringify(body);
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
            if (isAdmin) {
                localStorage.removeItem('admin');
                clearAdminToken();
                window.location.href = '/admin/login';
            } else {
                const user = localStorage.getItem('user');
                // Only auto-logout user if there IS a user session and the response is not a specific "chapter locked" payload.
                if (user && !data.is_locked) {
                    localStorage.removeItem('user');
                    clearAuthToken();
                    window.dispatchEvent(new Event('auth:logout'));
                }
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
