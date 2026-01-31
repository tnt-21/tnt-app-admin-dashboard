'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI } from '@/lib/api/bookings';

export function useBookings(filters: any = {}) {
    const bookingsQuery = useQuery({
        queryKey: ['admin-bookings', filters],
        queryFn: () => bookingsAPI.getAll(filters),
    });

    return {
        bookings: bookingsQuery.data?.bookings || [],
        pagination: bookingsQuery.data?.pagination || { total: 0, totalPages: 0, page: 1, limit: 20 },
        isLoading: bookingsQuery.isLoading,
        error: bookingsQuery.error,
        refetch: bookingsQuery.refetch
    };
}

export function useBookingDetails(id: string) {
    const detailsQuery = useQuery({
        queryKey: ['admin-booking', id],
        queryFn: () => bookingsAPI.getById(id),
        enabled: !!id
    });

    return {
        booking: detailsQuery.data,
        isLoading: detailsQuery.isLoading,
        error: detailsQuery.error,
        refetch: detailsQuery.refetch
    };
}

export function useBookingMutations() {
    const queryClient = useQueryClient();

    const updateStatus = useMutation({
        mutationFn: ({ id, statusId, reason }: { id: string, statusId: number, reason?: string }) =>
            bookingsAPI.updateStatus(id, statusId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['admin-booking'] });
        }
    });

    const assignCaregiver = useMutation({
        mutationFn: ({ bookingId, caregiverId }: { bookingId: string, caregiverId: string }) =>
            bookingsAPI.assignCaregiver(bookingId, caregiverId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['admin-booking'] });
        }
    });

    return {
        updateStatus,
        assignCaregiver
    };
}
