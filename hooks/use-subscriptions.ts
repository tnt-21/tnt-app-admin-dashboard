'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsAPI } from '@/lib/api/subscriptions';
import { toast } from 'sonner';

const EMPTY_ARRAY: any[] = [];

export function useSubscriptions(filters: any = {}) {
    const queryClient = useQueryClient();

    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ['subscriptions', filters],
        queryFn: () => subscriptionsAPI.getAll(filters),
    });

    return {
        subscriptions: subscriptions || EMPTY_ARRAY,
        isLoading,
    };
}
