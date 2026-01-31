import { apiClient } from '../api-client';

export const petsAPI = {
    /**
     * Get all pets globally with filters
     */
    getAll: async (filters: any = {}): Promise<any> => {
        const response = await apiClient.get('/admin/pets', { params: filters });
        return response.data;
    },

    /**
     * Get pet by ID globally
     */
    getById: async (id: string): Promise<any> => {
        const response = await apiClient.get(`/admin/pets/${id}`);
        return response.data.data;
    }
};
