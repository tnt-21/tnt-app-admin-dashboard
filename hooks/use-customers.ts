'use client';

import { useQuery } from '@tanstack/react-query';
import { customersAPI } from '@/lib/api/customers';

export function useCustomers(filters: any = {}) {
    const customersQuery = useQuery({
        queryKey: ['customers', filters],
        queryFn: () => customersAPI.getAll(filters),
    });

    return {
        customers: customersQuery.data?.data?.customers || [],
        pagination: customersQuery.data?.data?.pagination || { total: 0, totalPages: 0, page: 1, limit: 20 },
        isLoading: customersQuery.isLoading,
        error: customersQuery.error,
        refetch: customersQuery.refetch
    };
}

export function useCustomerDetails(id: string) {
    const detailsQuery = useQuery({
        queryKey: ['customer', id],
        queryFn: () => customersAPI.getById(id),
        enabled: !!id
    });

    return {
        customer: detailsQuery.data,
        isLoading: detailsQuery.isLoading,
        error: detailsQuery.error,
        refetch: detailsQuery.refetch
    };
}
