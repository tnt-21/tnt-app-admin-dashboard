import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '@/lib/api/community';
import { toast } from 'react-hot-toast';

export const useEvents = (filters: any = {}) => {
    return useQuery({
        queryKey: ['community-events', filters],
        queryFn: () => communityAPI.getAllEvents(filters)
    });
};

export const useCommunityMetrics = () => {
    return useQuery({
        queryKey: ['community-metrics'],
        queryFn: () => communityAPI.getMetrics()
    });
};

export const useEvent = (id: string) => {
    return useQuery({
        queryKey: ['community-event', id],
        queryFn: () => communityAPI.getEventById(id),
        enabled: !!id
    });
};

export const useEventRegistrations = (id: string) => {
    return useQuery({
        queryKey: ['event-registrations', id],
        queryFn: () => communityAPI.getEventRegistrations(id),
        enabled: !!id
    });
};

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => communityAPI.createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-events'] });
            toast.success('Event created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create event');
        }
    });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => communityAPI.updateEvent(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['community-events'] });
            queryClient.invalidateQueries({ queryKey: ['community-event', variables.id] });
            toast.success('Event updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update event');
        }
    });
};

export const useCancelEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => communityAPI.cancelEvent(id, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['community-events'] });
            queryClient.invalidateQueries({ queryKey: ['community-event', variables.id] });
            toast.success('Event cancelled successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to cancel event');
        }
    });
};

export const useUpdateRegistrationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => communityAPI.updateRegistrationStatus(id, status),
        onSuccess: (_, variables) => {
            // We don't know the event ID here easily without passing it, 
            // but we can invalidate all registrations or specific ones if we know.
            // For now, invalidate all registrations to be safe.
            queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
            toast.success(`Participant status updated to ${variables.status}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    });
};
