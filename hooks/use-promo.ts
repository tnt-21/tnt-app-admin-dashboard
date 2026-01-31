import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promoAPI } from '@/lib/api/promo';
import { toast } from 'react-hot-toast';

export const usePromoCodes = (filters: any = {}) => {
    return useQuery({
        queryKey: ['promo-codes', filters],
        queryFn: () => promoAPI.getAll(filters)
    });
};

export const usePromoCode = (id: string) => {
    return useQuery({
        queryKey: ['promo-code', id],
        queryFn: () => promoAPI.getById(id),
        enabled: !!id
    });
};

export const useCreatePromoCode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => promoAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
            toast.success('Promo code created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create promo code');
        }
    });
};

export const useUpdatePromoCode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => promoAPI.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
            queryClient.invalidateQueries({ queryKey: ['promo-code', variables.id] });
            toast.success('Promo code updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update promo code');
        }
    });
};

export const useDeletePromoCode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => promoAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
            toast.success('Promo code removed/deactivated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to remove promo code');
        }
    });
};
