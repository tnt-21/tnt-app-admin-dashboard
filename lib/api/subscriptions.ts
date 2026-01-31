import { apiClient } from '../api-client';

export const subscriptionsAPI = {
    /**
     * Get all active subscriptions
     */
    getAll: async (filters: any = {}): Promise<any[]> => {
        const response = await apiClient.get<any[]>('/admin/subscriptions', { params: filters });
        return response.data.data;
    },
};
