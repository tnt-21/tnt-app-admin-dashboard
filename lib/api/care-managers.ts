import { apiClient } from "../api-client";

export interface CareManager {
    care_manager_id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    photo_url: string | null;
    specialization: string | null;
    qualifications: string | null;
    experience_years: number;
    max_pets: number;
    current_pets_count: number;
    average_satisfaction_score: number | null;
    languages_spoken: string[];
    status: 'active' | 'inactive' | 'terminated';
    joined_date: string;
    created_at: string;
}

export interface CareManagerAssignment {
    assignment_id: string;
    care_manager_id: string;
    subscription_id: string;
    pet_id: string;
    user_id: string;
    assignment_date: string;
    is_active: boolean;
    pet_name?: string;
    pet_photo?: string;
    owner_name?: string;
    owner_email?: string;
    owner_phone?: string;
    tier_id?: string;
}

export interface CareManagerInteraction {
    interaction_id: string;
    assignment_id: string;
    interaction_type: string;
    interaction_date: string;
    duration_minutes: number;
    summary: string;
    action_items: any[];
    next_follow_up_date: string | null;
    created_by: string;
    created_by_name?: string;
}

export const careManagersAPI = {
    getAll: async (params?: any) => {
        const response = await apiClient.get('/admin/care-managers', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/admin/care-managers/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await apiClient.post('/admin/care-managers', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await apiClient.put(`/admin/care-managers/${id}`, data);
        return response.data;
    },

    promote: async (userId: string, data: any) => {
        const response = await apiClient.post(`/admin/care-managers/${userId}/promote`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/admin/care-managers/${id}`);
        return response.data;
    },

    // Assignments
    getAssignments: async (id: string) => {
        const response = await apiClient.get(`/admin/care-managers/${id}/assignments`);
        return response.data;
    },

    assignPet: async (id: string, assignmentData: { subscriptionId: string; petId: string; userId: string }) => {
        const response = await apiClient.post(`/admin/care-managers/${id}/assign`, assignmentData);
        return response.data;
    },

    unassignPet: async (assignmentId: string, reason: string) => {
        const response = await apiClient.post(`/admin/care-managers/assignments/${assignmentId}/unassign`, { reason });
        return response.data;
    },

    getUnassignedSubscriptions: async () => {
        const response = await apiClient.get('/admin/care-managers/unassigned-subscriptions');
        return response.data;
    },

    // Interactions
    getInteractions: async (assignmentId: string) => {
        const response = await apiClient.get(`/admin/care-managers/assignments/${assignmentId}/interactions`);
        return response.data;
    },

    addInteraction: async (assignmentId: string, data: any) => {
        const response = await apiClient.post(`/admin/care-managers/assignments/${assignmentId}/interactions`, data);
        return response.data;
    },
};
