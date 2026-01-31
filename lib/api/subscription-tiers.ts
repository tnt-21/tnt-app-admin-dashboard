import { apiClient } from '../api-client';
import type { SubscriptionTier } from '@/types';

export const subscriptionTiersAPI = {
    /**
     * Get all subscription tiers
     */
    getAll: async (): Promise<SubscriptionTier[]> => {
        const response = await apiClient.get<SubscriptionTier[]>('/admin/tiers');
        return response.data.data;
    },

    /**
     * Get tier by ID
     */
    getById: async (id: number): Promise<SubscriptionTier> => {
        const response = await apiClient.get<SubscriptionTier>(`/admin/tiers/${id}`);
        return response.data.data;
    },

    /**
     * Create new tier
     */
    create: async (data: Partial<SubscriptionTier>): Promise<SubscriptionTier> => {
        const response = await apiClient.post<SubscriptionTier>('/admin/tiers', data);
        return response.data.data;
    },

    /**
     * Update tier
     */
    update: async (id: number, data: Partial<SubscriptionTier>): Promise<SubscriptionTier> => {
        const response = await apiClient.put<SubscriptionTier>(`/admin/tiers/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete tier
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/tiers/${id}`);
    },

    /**
     * Toggle tier active status
     */
    toggleActive: async (id: number, isActive: boolean): Promise<SubscriptionTier> => {
        const response = await apiClient.patch<SubscriptionTier>(`/admin/tiers/${id}/status`, {
            is_active: isActive,
        });
        return response.data.data;
    },

    /**
     * Get tier configuration
     */
    getConfig: async (id: number): Promise<any[]> => {
        const response = await apiClient.get<any[]>(`/admin/tiers/${id}/config`);
        return response.data.data;
    },

    /**
     * Update tier configuration
     */
    updateConfig: async (id: number, data: any): Promise<any> => {
        const response = await apiClient.post<any>(`/admin/tiers/${id}/config`, data);
        return response.data.data;
    },

    /**
     * Get Fair Usage Policies
     */
    getFUP: async (tierId?: number): Promise<any[]> => {
        const response = await apiClient.get<any[]>('/admin/fup', { params: { tierId } });
        return response.data.data;
    },

    /**
     * Update Fair Usage Policy
     */
    updateFUP: async (id: string, data: any): Promise<any> => {
        const response = await apiClient.put<any>(`/admin/fup/${id}`, data);
        return response.data.data;
    },

    /**
     * Create Fair Usage Policy
     */
    createFUP: async (data: any): Promise<any> => {
        const response = await apiClient.post<any>('/admin/fup', data);
        return response.data.data;
    },
};
