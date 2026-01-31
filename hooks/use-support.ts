import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportAPI } from '@/lib/api/support';
import { toast } from 'sonner';

export const useSupportMetrics = () => {
    return useQuery({
        queryKey: ['support-metrics'],
        queryFn: () => supportAPI.getMetrics()
    });
};

export const useSupportTickets = (filters: any = {}) => {
    return useQuery({
        queryKey: ['support-tickets', filters],
        queryFn: () => supportAPI.getAllTickets(filters)
    });
};

export const useSupportTicket = (id: string) => {
    return useQuery({
        queryKey: ['support-ticket', id],
        queryFn: () => supportAPI.getTicketDetails(id),
        enabled: !!id
    });
};

export const useUpdateTicketStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: { status: string, resolution_notes?: string } }) =>
            supportAPI.updateTicketStatus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
            queryClient.invalidateQueries({ queryKey: ['support-metrics'] });
            toast.success('Ticket status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update ticket status');
        }
    });
};

export const useAssignTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, adminId }: { id: string, adminId: string }) =>
            supportAPI.assignTicket(id, adminId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
            toast.success('Ticket assigned successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to assign ticket');
        }
    });
};

export const useAddTicketMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: { message: string, attachments?: any[], is_internal?: boolean } }) =>
            supportAPI.addMessage(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.id] });
            toast.success(variables.data.is_internal ? 'Internal note added' : 'Reply sent');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add message');
        }
    });
};
