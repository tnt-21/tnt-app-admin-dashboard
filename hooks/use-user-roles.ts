'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userRolesAPI } from '@/lib/api/user-roles';
import type { UserRole } from '@/types';
import { toast } from 'sonner';

export function useUserRoles() {
    const queryClient = useQueryClient();

    // Get all roles
    const { data: roles, isLoading } = useQuery({
        queryKey: ['user-roles'],
        queryFn: userRolesAPI.getAll,
    });

    // Create role
    const createMutation = useMutation({
        mutationFn: (data: Partial<UserRole>) => userRolesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success('User role created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create user role');
        },
    });

    // Update role
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<UserRole> }) =>
            userRolesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success('User role updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user role');
        },
    });

    // Delete role
    const deleteMutation = useMutation({
        mutationFn: (id: number) => userRolesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success('User role deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete user role');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            userRolesAPI.toggleActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-roles'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return {
        roles: roles || [],
        isLoading,
        createRole: createMutation.mutate,
        updateRole: updateMutation.mutate,
        deleteRole: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
