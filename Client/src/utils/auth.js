import { clearReadingHistory } from './readingHistory';

/**
 * Centrally clears all authentication-related storage and triggers the logout event.
 * This ensures consistency across the application when a session expires.
 */
export const clearSession = () => {
    // Dynamically import to avoid circular dependencies
    import('../store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
    });
    window.dispatchEvent(new Event('auth:logout'));
};
