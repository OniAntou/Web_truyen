import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import { User } from '../types/user';

export const useAuthInitialization = () => {
    const { user, logout: storeLogout, updateUser } = useAuthStore();

    useEffect(() => {
        const checkAuth = async (shouldVerifyWithServer = false) => {
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (!user || user.id !== parsedUser.id) {
                        updateUser(parsedUser);
                    }
                    
                    if (shouldVerifyWithServer) {
                        try {
                            const latestUser = await userService.getMe();
                            // Only update if the data is actually different to avoid unnecessary re-renders
                            if (JSON.stringify(latestUser) !== JSON.stringify(user)) {
                                updateUser(latestUser as User);
                            }
                        } catch (err) {
                            // If server verification fails (e.g. token expired), storeLogout will be handled by apiClient
                        }
                    }
                } catch (e) {
                    localStorage.removeItem('user');
                }
            }
        };

        checkAuth(true);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkAuth(true);
            }
        };
        const handleFocus = () => checkAuth(true);
        
        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        const authInterval = setInterval(() => checkAuth(false), 60000);

        const handleLogoutEvent = () => {
            storeLogout();
            window.location.href = '/auth';
        };
        window.addEventListener('auth:logout', handleLogoutEvent);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(authInterval);
        };
    }, [storeLogout, updateUser, user]);
};
