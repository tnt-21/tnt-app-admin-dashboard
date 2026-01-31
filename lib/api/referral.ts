import { apiClient as api } from '../api-client';

export const referralAPI = {
    getStats: async () => {
        const response = await api.get('/admin/referrals/stats');
        return response.data.data;
    },

    getAll: async (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);

        const response = await api.get(`/admin/referrals?${params.toString()}`);
        return response.data.data;
    },

    getMyInfo: async () => {
        const response = await api.get('/users/me/referral');
        return response.data.data;
    }
};
