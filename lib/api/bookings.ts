import { apiClient } from '../api-client';

export const bookingsAPI = {
    /**
     * Get all bookings with filters (Admin)
     */
    getAll: async (filters: any = {}): Promise<any> => {
        const response = await apiClient.get('/admin/bookings', { params: filters });
        return response.data.data;
    },

    /**
     * Get booking details by ID (Admin)
     */
    getById: async (id: string): Promise<any> => {
        const response = await apiClient.get(`/admin/bookings/${id}`);
        return response.data.data;
    },

    /**
     * Update booking status (Admin)
     */
    updateStatus: async (id: string, statusId: number, reason?: string): Promise<any> => {
        const response = await apiClient.patch(`/admin/bookings/${id}/status`, { status_id: statusId, reason });
        return response.data.data;
    },

    assignCaregiver: async (bookingId: string, caregiverId: string): Promise<any> => {
        const response = await apiClient.patch(`/admin/bookings/${bookingId}/assign`, { caregiver_id: caregiverId });
        return response.data.data;
    },

    /**
     * Get available caregivers for a booking (Admin)
     */
    getAvailableCaregivers: async (bookingId: string): Promise<any> => {
        const response = await apiClient.get(`/admin/bookings/${bookingId}/available-caregivers`);
        return response.data.data;
    }
};
