'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingStatusesAPI } from '@/lib/api/booking-statuses';
import type { BookingStatus } from '@/types';
import { toast } from 'sonner';

export function useBookingStatuses() {
    const queryClient = useQueryClient();

    // Get all statuses
    const { data: statuses, isLoading } = useQuery({
        queryKey: ['booking-statuses'],
        queryFn: bookingStatusesAPI.getAll,
    });

    // Create status
    const createMutation = useMutation({
        mutationFn: (data: Partial<BookingStatus>) => bookingStatusesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-statuses'] });
            toast.success('Booking status created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create booking status');
        },
    });

    // Update status
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<BookingStatus> }) =>
            bookingStatusesAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-statuses'] });
            toast.success('Booking status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update booking status');
        },
    });

    // Delete status
    const deleteMutation = useMutation({
        mutationFn: (id: number) => bookingStatusesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-statuses'] });
            toast.success('Booking status deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete booking status');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            bookingStatusesAPI.toggleActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['booking-statuses'] });
            toast.success('Status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return {
        statuses: statuses || [],
        isLoading,
        createStatus: createMutation.mutate,
        updateStatus: updateMutation.mutate,
        deleteStatus: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
