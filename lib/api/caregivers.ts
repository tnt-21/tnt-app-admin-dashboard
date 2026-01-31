import { apiClient } from '../api-client';

export const caregiversAPI = {
    /**
     * Get all caregivers with filters
     */
    getAll: async (filters: any = {}): Promise<any> => {
        const response = await apiClient.get<any>('/admin/caregivers', { params: filters });
        return response.data;
    },

    /**
     * Get caregiver by ID
     */
    getById: async (id: string): Promise<any> => {
        const response = await apiClient.get<any>(`/admin/caregivers/${id}`);
        return response.data.data;
    },

    /**
     * Create a new caregiver
     */
    create: async (data: any): Promise<any> => {
        const response = await apiClient.post<any>('/admin/caregivers', data);
        return response.data.data;
    },

    /**
     * Update caregiver details
     */
    update: async (id: string, data: any): Promise<any> => {
        const response = await apiClient.put<any>(`/admin/caregivers/${id}`, data);
        return response.data.data;
    },

    /**
     * Promote a base user to caregiver
     */
    promote: async (userId: string, data: any): Promise<any> => {
        const response = await apiClient.post<any>(`/admin/caregivers/${userId}/promote`, data);
        return response.data.data;
    },

    /**
     * Delete (deactivate) caregiver
     */
    delete: async (id: string): Promise<any> => {
        const response = await apiClient.delete<any>(`/admin/caregivers/${id}`);
        return response.data.data;
    }
};
