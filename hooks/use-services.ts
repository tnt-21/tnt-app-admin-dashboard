'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI } from '@/lib/api/services';
import type { Service, ServiceEligibility, ServiceAvailability } from '@/types';
import { toast } from 'sonner';

export function useServices(filters: { category_id?: number; is_active?: boolean; search?: string } = {}) {
    const queryClient = useQueryClient();

    const servicesQuery = useQuery({
        queryKey: ['services', filters],
        queryFn: () => servicesAPI.getAll(filters),
    });

    const createServiceMutation = useMutation({
        mutationFn: (data: Partial<Service>) => servicesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success('Service created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create service');
        },
    });

    const updateServiceMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
            servicesAPI.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            queryClient.invalidateQueries({ queryKey: ['service', data.service_id] });
            toast.success('Service updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update service');
        },
    });

    const deleteServiceMutation = useMutation({
        mutationFn: (id: string) => servicesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success('Service deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete service');
        },
    });

    return {
        services: servicesQuery.data || [],
        isLoading: servicesQuery.isLoading,
        isError: servicesQuery.isError,
        error: servicesQuery.error,
        createService: createServiceMutation.mutateAsync,
        isCreating: createServiceMutation.isPending,
        updateService: updateServiceMutation.mutateAsync,
        isUpdating: updateServiceMutation.isPending,
        deleteService: deleteServiceMutation.mutateAsync,
        isDeleting: deleteServiceMutation.isPending,
    };
}

export function useService(id: string) {
    const queryClient = useQueryClient();

    const serviceQuery = useQuery({
        queryKey: ['service', id],
        queryFn: () => servicesAPI.getById(id),
        enabled: !!id,
    });

    const eligibilityQuery = useQuery({
        queryKey: ['service-eligibility', id],
        queryFn: () => servicesAPI.getEligibility(id),
        enabled: !!id,
    });

    const availabilityQuery = useQuery({
        queryKey: ['service-availability', id],
        queryFn: () => servicesAPI.getAvailability(id),
        enabled: !!id,
    });

    const updateEligibilityMutation = useMutation({
        mutationFn: (rules: ServiceEligibility[]) => servicesAPI.updateEligibility(id, rules),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-eligibility', id] });
            toast.success('Eligibility rules updated');
        },
    });

    const updateAvailabilityMutation = useMutation({
        mutationFn: (availability: ServiceAvailability[]) => servicesAPI.updateAvailability(id, availability),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-availability', id] });
            toast.success('Availability updated');
        },
    });

    return {
        service: serviceQuery.data,
        isLoading: serviceQuery.isLoading,
        eligibility: eligibilityQuery.data || [],
        isEligibilityLoading: eligibilityQuery.isLoading,
        availability: availabilityQuery.data || [],
        isAvailabilityLoading: availabilityQuery.isLoading,
        updateEligibility: updateEligibilityMutation.mutateAsync,
        isUpdatingEligibility: updateEligibilityMutation.isPending,
        updateAvailability: updateAvailabilityMutation.mutateAsync,
        isUpdatingAvailability: updateAvailabilityMutation.isPending,
    };
}
