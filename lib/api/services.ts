import { apiClient } from '../api-client';
import type { Service, ServiceEligibility, ServiceAvailability } from '@/types';

export const servicesAPI = {
    /**
     * Get all services with optional filters
     */
    getAll: async (filters: { category_id?: number; is_active?: boolean; search?: string } = {}): Promise<Service[]> => {
        const response = await apiClient.get('/admin/services', { params: filters });
        return response.data.data.services;
    },

    /**
     * Get service by ID
     */
    getById: async (id: string): Promise<Service> => {
        const response = await apiClient.get(`/admin/services/${id}`);
        return response.data.data;
    },

    /**
     * Create new service
     */
    create: async (data: Partial<Service>): Promise<Service> => {
        const response = await apiClient.post('/admin/services', data);
        return response.data.data;
    },

    /**
     * Update existing service
     */
    update: async (id: string, data: Partial<Service>): Promise<Service> => {
        const response = await apiClient.put(`/admin/services/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete service
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/services/${id}`);
    },

    /**
     * Get service eligibility rules
     */
    getEligibility: async (serviceId: string): Promise<ServiceEligibility[]> => {
        const response = await apiClient.get(`/admin/services/${serviceId}/eligibility`);
        return response.data.data;
    },

    /**
     * Update service eligibility rules
     */
    updateEligibility: async (serviceId: string, rules: ServiceEligibility[]): Promise<ServiceEligibility[]> => {
        const response = await apiClient.post(`/admin/services/${serviceId}/eligibility`, { rules });
        return response.data.data;
    },

    /**
     * Get service availability
     */
    getAvailability: async (serviceId: string): Promise<ServiceAvailability[]> => {
        const response = await apiClient.get(`/admin/services/${serviceId}/availability`);
        return response.data.data;
    },

    /**
     * Update service availability
     */
    updateAvailability: async (serviceId: string, availability: ServiceAvailability[]): Promise<ServiceAvailability[]> => {
        const response = await apiClient.post(`/admin/services/${serviceId}/availability`, { availability });
        return response.data.data;
    }
};
