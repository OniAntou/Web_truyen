import { getAuthToken } from './authToken';

export const withUserAuthHeaders = (headers: Record<string, string> = {}) => {
    const nextHeaders: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
        ...headers
    };
    const token = getAuthToken();
    if (token && !nextHeaders.Authorization) {
        return { ...nextHeaders, Authorization: `Bearer ${token}` };
    }
    return nextHeaders;
};
