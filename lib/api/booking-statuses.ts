import { apiClient } from '../api-client';
import type { BookingStatus } from '@/types';

export const bookingStatusesAPI = {
    /**
     * Get all booking statuses
     */
    getAll: async (): Promise<BookingStatus[]> => {
        const response = await apiClient.get<BookingStatus[]>('/admin/booking-statuses');
        return response.data.data;
    },

    /**
     * Get status by ID
     */
    getById: async (id: number): Promise<BookingStatus> => {
        const response = await apiClient.get<BookingStatus>(`/admin/booking-statuses/${id}`);
        return response.data.data;
    },

    /**
     * Create new status
     */
    create: async (data: Partial<BookingStatus>): Promise<BookingStatus> => {
        const response = await apiClient.post<BookingStatus>('/admin/booking-statuses', data);
        return response.data.data;
    },

    /**
     * Update status
     */
    update: async (id: number, data: Partial<BookingStatus>): Promise<BookingStatus> => {
        const response = await apiClient.put<BookingStatus>(`/admin/booking-statuses/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete status
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/booking-statuses/${id}`);
    },

    /**
     * Toggle active status
     */
    toggleActive: async (id: number, isActive: boolean): Promise<BookingStatus> => {
        const response = await apiClient.patch<BookingStatus>(`/admin/booking-statuses/${id}/status`, {
            is_active: isActive,
        });
        return response.data.data;
    },
};
