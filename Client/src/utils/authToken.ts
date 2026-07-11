export const clearAuthToken = () => {
    localStorage.removeItem('authToken');
};

export const clearAdminToken = () => {
    localStorage.removeItem('adminToken');
};
