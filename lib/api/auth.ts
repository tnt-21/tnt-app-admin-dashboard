import { apiClient } from '../api-client';
import type { AuthResponse, LoginCredentials, User } from '@/types';

export const authAPI = {
    /**
     * Login admin user
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/admin/login', credentials);
        return response.data.data;
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me');
        return response.data.data;
    },

    /**
     * Logout
     */
    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    },
};
