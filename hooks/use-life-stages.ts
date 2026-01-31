'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifeStagesAPI } from '@/lib/api/life-stages';
import type { LifeStage } from '@/types';
import { toast } from 'sonner';

const EMPTY_ARRAY: any[] = [];

export function useLifeStages(speciesId?: number) {
    const queryClient = useQueryClient();

    // Get all life stages
    const { data: lifeStages, isLoading } = useQuery({
        queryKey: ['life-stages', speciesId],
        queryFn: () => lifeStagesAPI.getAll(speciesId),
    });

    // Create life stage
    const createMutation = useMutation({
        mutationFn: (data: Partial<LifeStage>) => lifeStagesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['life-stages'] });
            toast.success('Life stage created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create life stage');
        },
    });

    // Update life stage
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<LifeStage> }) =>
            lifeStagesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['life-stages'] });
            toast.success('Life stage updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update life stage');
        },
    });

    // Delete life stage
    const deleteMutation = useMutation({
        mutationFn: (id: number) => lifeStagesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['life-stages'] });
            toast.success('Life stage deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete life stage');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            lifeStagesAPI.toggleActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['life-stages'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return {
        lifeStages: lifeStages || EMPTY_ARRAY,
        isLoading,
        createLifeStage: createMutation.mutate,
        updateLifeStage: updateMutation.mutate,
        deleteLifeStage: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
