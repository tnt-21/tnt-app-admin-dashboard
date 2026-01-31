import { apiClient } from '../api-client';

export interface AppSetting {
    setting_id: string;
    setting_key: string;
    setting_value: string;
    setting_type: string;
    category: string;
    description?: string;
    is_public: boolean;
    updated_by?: string;
    updated_at: string;
}

export interface AdminUser {
    admin_id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    photo_url?: string;
    role: string;
    department?: string;
    permissions?: Record<string, any>;
    can_access_finance: boolean;
    can_manage_users: boolean;
    can_manage_caregivers: boolean;
    can_manage_content: boolean;
    is_active: boolean;
    joined_date: string;
    created_at: string;
}

export interface AuditLog {
    log_id: string;
    admin_id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    old_value?: any;
    new_value?: any;
    changes_summary?: string;
    ip_address?: string;
    user_agent?: string;
    severity: string;
    created_at: string;
    admin_name?: string;
    admin_email?: string;
}

export interface AuditFilters {
    admin_id?: string;
    entity_type?: string;
    action?: string;
    severity?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}

export const settingsAPI = {
    /**
     * Get all app settings
     */
    getSettings: async (): Promise<{ settings: AppSetting[] }> => {
        const response = await apiClient.get<{ settings: AppSetting[] }>('/config/settings');
        return response.data.data;
    },

    /**
     * Upsert an app setting
     */
    upsertSetting: async (data: Partial<AppSetting>): Promise<AppSetting> => {
        const response = await apiClient.post<AppSetting>('/config/settings', data);
        return response.data.data;
    },

    /**
     * Delete a setting
     */
    deleteSetting: async (key: string): Promise<void> => {
        await apiClient.delete(`/config/settings/${key}`);
    },

    /**
     * Get all admin users
     */
    getAdminUsers: async (filters: any = {}): Promise<{ admin_users: AdminUser[]; pagination: any }> => {
        const response = await apiClient.get<{ admin_users: AdminUser[]; pagination: any }>('/admin/admin-users', { params: filters });
        return response.data.data;
    },

    /**
     * Get admin user by ID
     */
    getAdminUserById: async (id: string): Promise<AdminUser> => {
        const response = await apiClient.get<AdminUser>(`/admin/admin-users/${id}`);
        return response.data.data;
    },

    /**
     * Create admin user
     */
    createAdminUser: async (data: Partial<AdminUser> & { password?: string }): Promise<AdminUser> => {
        const response = await apiClient.post<AdminUser>('/admin/admin-users', data);
        return response.data.data;
    },

    /**
     * Update admin user
     */
    updateAdminUser: async (id: string, data: Partial<AdminUser>): Promise<AdminUser> => {
        const response = await apiClient.put<AdminUser>(`/admin/admin-users/${id}`, data);
        return response.data.data;
    },

    /**
     * Toggle admin user status
     */
    toggleAdminUserStatus: async (id: string, is_active: boolean): Promise<void> => {
        await apiClient.patch(`/admin/admin-users/${id}/status`, { is_active });
    },

    /**
     * Get audit logs
     */
    getAuditLogs: async (filters: AuditFilters = {}): Promise<{ logs: AuditLog[]; pagination: any }> => {
        const response = await apiClient.get<{ logs: AuditLog[]; pagination: any }>('/audit/logs', { params: filters });
        return response.data.data;
    },

    /**
     * Get audit statistics
     */
    getAuditStats: async (filters: { start_date?: string; end_date?: string } = {}): Promise<any> => {
        const response = await apiClient.get('/audit/stats', { params: filters });
        return response.data.data;
    }
};
