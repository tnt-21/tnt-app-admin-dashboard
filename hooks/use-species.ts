'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { speciesAPI } from '@/lib/api/species';
import type { Species } from '@/types';
import { toast } from 'sonner';

const EMPTY_ARRAY: any[] = [];

export function useSpecies() {
    const queryClient = useQueryClient();

    // Get all species
    const { data: species, isLoading } = useQuery({
        queryKey: ['species'],
        queryFn: speciesAPI.getAll,
    });

    // Create species
    const createMutation = useMutation({
        mutationFn: (data: Partial<Species>) => speciesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['species'] });
            toast.success('Species created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create species');
        },
    });

    // Update species
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Species> }) =>
            speciesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['species'] });
            toast.success('Species updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update species');
        },
    });

    // Delete species
    const deleteMutation = useMutation({
        mutationFn: (id: number) => speciesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['species'] });
            toast.success('Species deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete species');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            speciesAPI.toggleActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['species'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return {
        species: species || EMPTY_ARRAY,
        isLoading,
        createSpecies: createMutation.mutate,
        updateSpecies: updateMutation.mutate,
        deleteSpecies: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
