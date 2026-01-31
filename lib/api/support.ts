import { apiClient as api } from '../api-client';

export const supportAPI = {
    getMetrics: async () => {
        const response = await api.get('/admin/support/metrics');
        return response.data.data;
    },

    getAllTickets: async (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/admin/support/tickets?${params.toString()}`);
        return response.data.data;
    },

    getTicketDetails: async (id: string) => {
        const response = await api.get(`/admin/support/tickets/${id}`);
        return response.data.data;
    },

    updateTicketStatus: async (id: string, data: { status: string, resolution_notes?: string }) => {
        const response = await api.patch(`/admin/support/tickets/${id}/status`, data);
        return response.data.data;
    },

    assignTicket: async (id: string, adminId: string) => {
        const response = await api.patch(`/admin/support/tickets/${id}/assign`, { admin_id: adminId });
        return response.data.data;
    },

    addMessage: async (id: string, data: { message: string, attachments?: any[], is_internal?: boolean }) => {
        const response = await api.post(`/admin/support/tickets/${id}/messages`, data);
        return response.data.data;
    }
};
