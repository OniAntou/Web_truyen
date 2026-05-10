const AUTH_TOKEN_KEY = 'authToken';
const ADMIN_TOKEN_KEY = 'adminToken';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token?: string | null) => {
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
};

export const clearAuthToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token?: string | null) => {
    if (token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
};

export const clearAdminToken = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
};
