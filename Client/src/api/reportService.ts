import apiClient from './apiClient';
import type { ReportData } from '../types/api';

export const reportService = {
    createReport: async (reportData: ReportData) => {
        return apiClient('/reports', {
            method: 'POST',
            body: reportData as unknown as Record<string, unknown>
        });
    },
    
    getMyReports: async () => {
        return apiClient('/reports/my');
    }
};
