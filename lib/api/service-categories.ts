import { apiClient } from '../api-client';
import type { ServiceCategory } from '@/types';

export const serviceCategoriesAPI = {
    /**
     * Get all service categories
     */
    getAll: async (): Promise<ServiceCategory[]> => {
        const response = await apiClient.get<ServiceCategory[]>('/admin/service-categories');
        return response.data.data;
    },

    /**
     * Get category by ID
     */
    getById: async (id: number): Promise<ServiceCategory> => {
        const response = await apiClient.get<ServiceCategory>(`/admin/service-categories/${id}`);
        return response.data.data;
    },

    /**
     * Create new category
     */
    create: async (data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
        const response = await apiClient.post<ServiceCategory>('/admin/service-categories', data);
        return response.data.data;
    },

    /**
     * Update category
     */
    update: async (id: number, data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
        const response = await apiClient.put<ServiceCategory>(`/admin/service-categories/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete category
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/service-categories/${id}`);
    },

    /**
     * Toggle active status
     */
    toggleActive: async (id: number, isActive: boolean): Promise<ServiceCategory> => {
        const response = await apiClient.patch<ServiceCategory>(`/admin/service-categories/${id}/status`, {
            is_active: isActive,
        });
        return response.data.data;
    },
};
