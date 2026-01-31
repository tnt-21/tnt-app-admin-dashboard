'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caregiversAPI } from '@/lib/api/caregivers';
import { toast } from 'react-hot-toast';

const EMPTY_ARRAY: any[] = [];

export function useCaregivers(filters: any = {}) {
    const caregiversQuery = useQuery({
        queryKey: ['caregivers', filters],
        queryFn: () => caregiversAPI.getAll(filters),
    });

    return {
        caregivers: (caregiversQuery.data as any)?.data?.caregivers || EMPTY_ARRAY,
        pagination: (caregiversQuery.data as any)?.data?.pagination,
        isLoading: caregiversQuery.isLoading,
        error: caregiversQuery.error,
        refetch: caregiversQuery.refetch
    };
}

export function useCaregiverDetails(id: string) {
    const detailsQuery = useQuery({
        queryKey: ['caregiver', id],
        queryFn: () => caregiversAPI.getById(id),
        enabled: !!id
    });

    return {
        caregiver: detailsQuery.data,
        isLoading: detailsQuery.isLoading,
        error: detailsQuery.error
    };
}

export function useCaregiverMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: caregiversAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caregivers'] });
            toast.success('Caregiver created successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => caregiversAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caregivers'] });
            toast.success('Caregiver updated successfully');
        }
    });

    const promoteMutation = useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: any }) => caregiversAPI.promote(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caregivers'] });
            toast.success('User promoted to Caregiver');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: caregiversAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caregivers'] });
            toast.success('Caregiver deactivated');
        }
    });

    return {
        createCaregiver: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateCaregiver: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        promoteUser: promoteMutation.mutateAsync,
        isPromoting: promoteMutation.isPending,
        deleteCaregiver: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
}
