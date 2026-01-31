'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceCategoriesAPI } from '@/lib/api/service-categories';
import type { ServiceCategory } from '@/types';
import { toast } from 'sonner';

const EMPTY_ARRAY: any[] = [];

export function useServiceCategories() {
    const queryClient = useQueryClient();

    // Get all categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ['service-categories'],
        queryFn: serviceCategoriesAPI.getAll,
    });

    // Create category
    const createMutation = useMutation({
        mutationFn: (data: Partial<ServiceCategory>) => serviceCategoriesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
            toast.success('Service category created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create service category');
        },
    });

    // Update category
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ServiceCategory> }) =>
            serviceCategoriesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
            toast.success('Service category updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update service category');
        },
    });

    // Delete category
    const deleteMutation = useMutation({
        mutationFn: (id: number) => serviceCategoriesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
            toast.success('Service category deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete service category');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            serviceCategoriesAPI.toggleActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return {
        categories: categories || EMPTY_ARRAY,
        isLoading,
        createCategory: createMutation.mutate,
        updateCategory: updateMutation.mutate,
        deleteCategory: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
