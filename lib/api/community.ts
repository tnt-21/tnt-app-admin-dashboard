import { apiClient as api } from '../api-client';

export const communityAPI = {
    getMetrics: async () => {
        const response = await api.get('/admin/community/metrics');
        return response.data.data;
    },

    getAllEvents: async (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.event_type) params.append('event_type', filters.event_type);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/admin/community/events?${params.toString()}`);
        return response.data.data;
    },

    getEventById: async (id: string) => {
        // We use the public event detail API but since we are admin it returns full data?
        // Actually we might need an admin specific detail route if public one is limited.
        // For now let's assume public one is okay or let's add an admin detail route.
        // I didn't add an admin detail route yet, let's use the one I added for registrations
        const response = await api.get(`/community/events/${id}`);
        return response.data.data;
    },

    createEvent: async (data: any) => {
        const response = await api.post('/admin/community/events', data);
        return response.data.data;
    },

    updateEvent: async (id: string, data: any) => {
        const response = await api.patch(`/admin/community/events/${id}`, data);
        return response.data.data;
    },

    cancelEvent: async (id: string, reason: string) => {
        const response = await api.delete(`/admin/community/events/${id}`, { data: { reason } });
        return response.data.data;
    },

    getEventRegistrations: async (id: string) => {
        const response = await api.get(`/admin/community/events/${id}/registrations`);
        return response.data.data;
    },

    updateRegistrationStatus: async (id: string, status: string) => {
        const response = await api.patch(`/admin/community/registrations/${id}/status`, { status });
        return response.data.data;
    }
};
