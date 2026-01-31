'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI, type AuditFilters } from '@/lib/api/settings';
import { toast } from 'react-hot-toast';

export function useSettings() {
    return useQuery({
        queryKey: ['settings'],
        queryFn: () => settingsAPI.getSettings(),
    });
}

export function useSettingMutations() {
    const queryClient = useQueryClient();

    const upsertMutation = useMutation({
        mutationFn: settingsAPI.upsertSetting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Setting updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: settingsAPI.deleteSetting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Setting deleted successfully');
        }
    });

    return {
        upsertSetting: upsertMutation.mutateAsync,
        isUpserting: upsertMutation.isPending,
        deleteSetting: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
}

export function useAdminUsers(filters: any = {}) {
    return useQuery({
        queryKey: ['admin-users', filters],
        queryFn: () => settingsAPI.getAdminUsers(filters),
    });
}

export function useAdminUserDetails(id: string) {
    return useQuery({
        queryKey: ['admin-user', id],
        queryFn: () => settingsAPI.getAdminUserById(id),
        enabled: !!id
    });
}

export function useAdminUserMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: settingsAPI.createAdminUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('Admin user created successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => settingsAPI.updateAdminUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('Admin user updated successfully');
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
            settingsAPI.toggleAdminUserStatus(id, is_active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('Admin user status updated');
        }
    });

    return {
        createAdminUser: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateAdminUser: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        toggleStatus: toggleStatusMutation.mutateAsync,
        isTogglingStatus: toggleStatusMutation.isPending
    };
}

export function useAuditLogs(filters: AuditFilters = {}) {
    return useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: () => settingsAPI.getAuditLogs(filters),
    });
}

export function useAuditStats(filters: { start_date?: string; end_date?: string } = {}) {
    return useQuery({
        queryKey: ['audit-stats', filters],
        queryFn: () => settingsAPI.getAuditStats(filters),
    });
}
