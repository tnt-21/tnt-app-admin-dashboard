import { apiClient } from '../api-client';

export const customersAPI = {
    /**
     * Get all customers with filters
     */
    getAll: async (filters: any = {}): Promise<any> => {
        const response = await apiClient.get('/admin/customers', { params: filters });
        return response.data;
    },

    /**
     * Get customer by ID
     */
    getById: async (id: string): Promise<any> => {
        const response = await apiClient.get(`/admin/customers/${id}`);
        return response.data.data;
    }
};
