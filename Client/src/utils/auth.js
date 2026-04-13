import { clearReadingHistory } from './readingHistory';

/**
 * Centrally clears all authentication-related storage and triggers the logout event.
 * This ensures consistency across the application when a session expires.
 */
export const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearReadingHistory();
    window.dispatchEvent(new Event('auth:logout'));
};
