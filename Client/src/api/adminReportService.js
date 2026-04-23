import apiClient from './apiClient';

export const adminReportService = {
    getAllReports: async (params) => {
        const token = localStorage.getItem('adminToken');
        let endpoint = '/admin/reports';
        const queryParams = [];
        if (params.page) queryParams.push(`page=${params.page}`);
        if (params.status) queryParams.push(`status=${params.status}`);
        if (params.type) queryParams.push(`type=${params.type}`);
        if (params.limit) queryParams.push(`limit=${params.limit}`);
        
        if (queryParams.length > 0) {
            endpoint += `?${queryParams.join('&')}`;
        }

        return apiClient(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },
    
    updateReportStatus: async (id, status) => {
        const token = localStorage.getItem('adminToken');
        return apiClient(`/admin/reports/${id}/status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: { status }
        });
    },
    
    deleteReport: async (id) => {
        const token = localStorage.getItem('adminToken');
        return apiClient(`/admin/reports/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};
