import { apiClient } from '../api-client';
import type { LocationType } from '@/types';

export const locationTypesAPI = {
    /**
     * Get all location types
     */
    getAll: async (): Promise<LocationType[]> => {
        const response = await apiClient.get<LocationType[]>('/admin/location-types');
        return response.data.data;
    },

    /**
     * Get type by ID
     */
    getById: async (id: number): Promise<LocationType> => {
        const response = await apiClient.get<LocationType>(`/admin/location-types/${id}`);
        return response.data.data;
    },

    /**
     * Create new type
     */
    create: async (data: Partial<LocationType>): Promise<LocationType> => {
        const response = await apiClient.post<LocationType>('/admin/location-types', data);
        return response.data.data;
    },

    /**
     * Update type
     */
    update: async (id: number, data: Partial<LocationType>): Promise<LocationType> => {
        const response = await apiClient.put<LocationType>(`/admin/location-types/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete type
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/location-types/${id}`);
    },

    /**
     * Toggle active status
     */
    toggleActive: async (id: number, isActive: boolean): Promise<LocationType> => {
        const response = await apiClient.patch<LocationType>(`/admin/location-types/${id}/status`, {
            is_active: isActive,
        });
        return response.data.data;
    },
};
