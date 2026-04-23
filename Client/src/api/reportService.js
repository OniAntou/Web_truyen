import apiClient from './apiClient';

export const reportService = {
    createReport: async (reportData) => {
        const token = localStorage.getItem('token');
        return apiClient('/reports', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: reportData
        });
    },
    
    getMyReports: async () => {
        const token = localStorage.getItem('token');
        return apiClient('/reports/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};
