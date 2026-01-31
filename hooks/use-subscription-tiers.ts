'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionTiersAPI } from '@/lib/api/subscription-tiers';
import type { SubscriptionTier } from '@/types';
import { toast } from 'sonner';

const EMPTY_ARRAY: any[] = [];

export function useSubscriptionTiers() {
    const queryClient = useQueryClient();

    // Get all tiers
    const { data: tiers, isLoading } = useQuery({
        queryKey: ['subscription-tiers'],
        queryFn: subscriptionTiersAPI.getAll,
    });

    // Create tier
    const createMutation = useMutation({
        mutationFn: (data: Partial<SubscriptionTier>) => subscriptionTiersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
            toast.success('Subscription tier created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create subscription tier');
        },
    });

    // Update tier
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SubscriptionTier> }) =>
            subscriptionTiersAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
            toast.success('Subscription tier updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update subscription tier');
        },
    });

    // Delete tier
    const deleteMutation = useMutation({
        mutationFn: (id: number) => subscriptionTiersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
            toast.success('Subscription tier deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete subscription tier');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            subscriptionTiersAPI.toggleActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return {
        tiers: tiers || EMPTY_ARRAY,
        isLoading,
        createTier: createMutation.mutate,
        updateTier: updateMutation.mutate,
        deleteTier: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

export function useTierConfig(id: number) {
    const queryClient = useQueryClient();

    const configQuery = useQuery({
        queryKey: ['tier-config', id],
        queryFn: () => subscriptionTiersAPI.getConfig(id),
        enabled: !!id,
    });

    const updateConfigMutation = useMutation({
        mutationFn: (data: any) => subscriptionTiersAPI.updateConfig(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tier-config', id] });
            toast.success('Tier configuration updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update tier configuration');
        },
    });

    return {
        config: configQuery.data || EMPTY_ARRAY,
        isLoading: configQuery.isLoading,
        updateConfig: updateConfigMutation.mutateAsync,
        isUpdating: updateConfigMutation.isPending,
    };
}

export function useTierFUP(tierId?: number) {
    const queryClient = useQueryClient();

    const fupQuery = useQuery({
        queryKey: ['tier-fup', tierId],
        queryFn: () => subscriptionTiersAPI.getFUP(tierId),
    });

    const updateFUPMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => subscriptionTiersAPI.updateFUP(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tier-fup'] });
            toast.success('Fair usage policy updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update fair usage policy');
        },
    });

    const createFUPMutation = useMutation({
        mutationFn: (data: any) => subscriptionTiersAPI.createFUP(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tier-fup'] });
            toast.success('Fair usage policy created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create fair usage policy');
        },
    });

    return {
        policies: fupQuery.data || EMPTY_ARRAY,
        isLoading: fupQuery.isLoading,
        updateFUP: updateFUPMutation.mutateAsync,
        createFUP: createFUPMutation.mutateAsync,
        isUpdating: updateFUPMutation.isPending || createFUPMutation.isPending,
    };
}
