import { apiClient } from '../api-client';
import type { Species } from '@/types';

export const speciesAPI = {
    /**
     * Get all species
     */
    getAll: async (): Promise<Species[]> => {
        const response = await apiClient.get<Species[]>('/admin/species');
        return response.data.data;
    },

    /**
     * Get species by ID
     */
    getById: async (id: number): Promise<Species> => {
        const response = await apiClient.get<Species>(`/admin/species/${id}`);
        return response.data.data;
    },

    /**
     * Create new species
     */
    create: async (data: Partial<Species>): Promise<Species> => {
        const response = await apiClient.post<Species>('/admin/species', data);
        return response.data.data;
    },

    /**
     * Update species
     */
    update: async (id: number, data: Partial<Species>): Promise<Species> => {
        const response = await apiClient.put<Species>(`/admin/species/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete species
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/species/${id}`);
    },

    /**
     * Toggle species active status
     */
    toggleActive: async (id: number, isActive: boolean): Promise<Species> => {
        const response = await apiClient.patch<Species>(`/admin/species/${id}/status`, {
            is_active: isActive,
        });
        return response.data.data;
    },
};
