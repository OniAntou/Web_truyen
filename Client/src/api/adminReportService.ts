import apiClient from './apiClient';
import type { AdminReportParams } from '../types/api';

export const adminReportService = {
    getAllReports: async (params: AdminReportParams) => {
        let endpoint = '/admin/reports';
        const queryParams: string[] = [];
        if (params.page) queryParams.push(`page=${params.page}`);
        if (params.status) queryParams.push(`status=${params.status}`);
        if (params.type) queryParams.push(`type=${params.type}`);
        if (params.limit) queryParams.push(`limit=${params.limit}`);
        
        if (queryParams.length > 0) {
            endpoint += `?${queryParams.join('&')}`;
        }

        return apiClient<{ reports: any[], total: number }>(endpoint);
    },
    
    updateReportStatus: async (id: string, status: string) => {
        return apiClient<{ message: string }>(`/admin/reports/${id}/status`, {
            method: 'PATCH',
            body: { status }
        });
    },
    
    deleteReport: async (id: string) => {
        return apiClient<{ message: string }>(`/admin/reports/${id}`, {
            method: 'DELETE'
        });
    }
};
