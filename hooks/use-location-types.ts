'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationTypesAPI } from '@/lib/api/location-types';
import type { LocationType } from '@/types';
import { toast } from 'sonner';

export function useLocationTypes() {
    const queryClient = useQueryClient();

    // Get all types
    const { data: types, isLoading } = useQuery({
        queryKey: ['location-types'],
        queryFn: locationTypesAPI.getAll,
    });

    // Create type
    const createMutation = useMutation({
        mutationFn: (data: Partial<LocationType>) => locationTypesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['location-types'] });
            toast.success('Location type created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create location type');
        },
    });

    // Update type
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<LocationType> }) =>
            locationTypesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['location-types'] });
            toast.success('Location type updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update location type');
        },
    });

    // Delete type
    const deleteMutation = useMutation({
        mutationFn: (id: number) => locationTypesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['location-types'] });
            toast.success('Location type deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete location type');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            locationTypesAPI.toggleActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['location-types'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return {
        types: types || [],
        isLoading,
        createType: createMutation.mutate,
        updateType: updateMutation.mutate,
        deleteType: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
