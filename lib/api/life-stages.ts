import { apiClient } from '../api-client';
import type { LifeStage } from '@/types';

export const lifeStagesAPI = {
    /**
     * Get all life stages
     */
    getAll: async (speciesId?: number): Promise<LifeStage[]> => {
        const response = await apiClient.get<LifeStage[]>('/admin/life-stages', {
            params: { speciesId },
        });
        return response.data.data;
    },

    /**
     * Get life stage by ID
     */
    getById: async (id: number): Promise<LifeStage> => {
        const response = await apiClient.get<LifeStage>(`/admin/life-stages/${id}`);
        return response.data.data;
    },

    /**
     * Create new life stage
     */
    create: async (data: Partial<LifeStage>): Promise<LifeStage> => {
        const response = await apiClient.post<LifeStage>('/admin/life-stages', data);
        return response.data.data;
    },

    /**
     * Update life stage
     */
    update: async (id: number, data: Partial<LifeStage>): Promise<LifeStage> => {
        const response = await apiClient.put<LifeStage>(`/admin/life-stages/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete life stage
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/life-stages/${id}`);
    },

    /**
     * Toggle life stage active status
     */
    toggleActive: async (id: number, isActive: boolean): Promise<LifeStage> => {
        const response = await apiClient.patch<LifeStage>(`/admin/life-stages/${id}/status`, {
            is_active: isActive,
        });
        return response.data.data;
    },
};
