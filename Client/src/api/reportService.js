import apiClient from './apiClient';

export const reportService = {
    createReport: async (reportData) => {
        return apiClient('/reports', {
            method: 'POST',
            body: reportData
        });
    },
    
    getMyReports: async () => {
        return apiClient('/reports/my');
    }
};
