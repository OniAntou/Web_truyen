/**
 * Centrally clears all authentication-related storage and triggers the logout event.
 * This ensures consistency across the application when a session expires.
 */
export const clearSession = async () => {
    try {
        const { authService } = await import('../api/authService');
        await authService.logout();
    } catch (err) {
        console.error('Logout API failed:', err);
    }
    // Dynamically import to avoid circular dependencies
    const { useAuthStore } = await import('../store/authStore');
    useAuthStore.getState().logout();
    
    window.dispatchEvent(new Event('auth:logout'));
};
