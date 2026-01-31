import { apiClient as api } from '../api-client';

export const promoAPI = {
    getAll: async (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

        const response = await api.get(`/config/promo-codes?${params.toString()}`);
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/config/promo-codes/${id}`);
        return response.data.data;
    },

    create: async (data: any) => {
        const response = await api.post('/config/promo-codes', data);
        return response.data.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/config/promo-codes/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/config/promo-codes/${id}`);
        return response.data.data;
    }
};
