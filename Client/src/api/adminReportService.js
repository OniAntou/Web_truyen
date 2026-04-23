import apiClient from './apiClient';

export const adminReportService = {
    getAllReports: async (params) => {
        let endpoint = '/admin/reports';
        const queryParams = [];
        if (params.page) queryParams.push(`page=${params.page}`);
        if (params.status) queryParams.push(`status=${params.status}`);
        if (params.type) queryParams.push(`type=${params.type}`);
        if (params.limit) queryParams.push(`limit=${params.limit}`);
        
        if (queryParams.length > 0) {
            endpoint += `?${queryParams.join('&')}`;
        }

        return apiClient(endpoint);
    },
    
    updateReportStatus: async (id, status) => {
        return apiClient(`/admin/reports/${id}/status`, {
            method: 'PATCH',
            body: { status }
        });
    },
    
    deleteReport: async (id) => {
        return apiClient(`/admin/reports/${id}`, {
            method: 'DELETE'
        });
    }
};
