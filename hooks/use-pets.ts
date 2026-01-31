'use client';

import { useQuery } from '@tanstack/react-query';
import { petsAPI } from '@/lib/api/pets';

export function usePets(filters: any = {}) {
    const petsQuery = useQuery({
        queryKey: ['pets-global', filters],
        queryFn: () => petsAPI.getAll(filters),
    });

    return {
        pets: petsQuery.data?.data?.pets || [],
        pagination: petsQuery.data?.data?.pagination || { total: 0, totalPages: 0, page: 1, limit: 20 },
        isLoading: petsQuery.isLoading,
        error: petsQuery.error,
        refetch: petsQuery.refetch
    };
}

export function usePetDetails(id: string) {
    const detailsQuery = useQuery({
        queryKey: ['pet-global', id],
        queryFn: () => petsAPI.getById(id),
        enabled: !!id
    });

    return {
        pet: detailsQuery.data,
        isLoading: detailsQuery.isLoading,
        error: detailsQuery.error,
        refetch: detailsQuery.refetch
    };
}
