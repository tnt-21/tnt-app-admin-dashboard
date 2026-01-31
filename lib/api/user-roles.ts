import { apiClient } from '../api-client';
import type { UserRole } from '@/types';

export const userRolesAPI = {
    /**
     * Get all user roles
     */
    getAll: async (): Promise<UserRole[]> => {
        const response = await apiClient.get<UserRole[]>('/admin/user-roles');
        return response.data.data;
    },

    /**
     * Get role by ID
     */
    getById: async (id: number): Promise<UserRole> => {
        const response = await apiClient.get<UserRole>(`/admin/user-roles/${id}`);
        return response.data.data;
    },

    /**
     * Create new role
     */
    create: async (data: Partial<UserRole>): Promise<UserRole> => {
        const response = await apiClient.post<UserRole>('/admin/user-roles', data);
        return response.data.data;
    },

    /**
     * Update role
     */
    update: async (id: number, data: Partial<UserRole>): Promise<UserRole> => {
        const response = await apiClient.put<UserRole>(`/admin/user-roles/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete role
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/user-roles/${id}`);
    },

    /**
     * Toggle active status
     */
    toggleActive: async (id: number, isActive: boolean): Promise<UserRole> => {
        const response = await apiClient.patch<UserRole>(`/admin/user-roles/${id}/status`, {
            is_active: isActive,
        });
        return response.data.data;
    },
};
