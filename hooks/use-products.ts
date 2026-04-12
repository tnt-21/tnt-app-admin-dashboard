'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '@/lib/api/products';
import type { Product } from '@/types';
import { toast } from 'sonner';

export function useProducts(filters: { is_active?: boolean; search?: string } = {}) {
    const queryClient = useQueryClient();

    const productsQuery = useQuery({
        queryKey: ['products', filters],
        queryFn: () => productsAPI.getAll(filters),
    });

    const createProductMutation = useMutation({
        mutationFn: (data: Partial<Product>) => productsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create product');
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
            productsAPI.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
            toast.success('Product updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update product');
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => productsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        },
    });

    return {
        products: productsQuery.data || [],
        isLoading: productsQuery.isLoading,
        isError: productsQuery.isError,
        error: productsQuery.error,
        createProduct: createProductMutation.mutateAsync,
        isCreating: createProductMutation.isPending,
        updateProduct: updateProductMutation.mutateAsync,
        isUpdating: updateProductMutation.isPending,
        deleteProduct: deleteProductMutation.mutateAsync,
        isDeleting: deleteProductMutation.isPending,
    };
}

export function useProduct(id: string) {
    const productQuery = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsAPI.getById(id),
        enabled: !!id,
    });

    return {
        product: productQuery.data,
        isLoading: productQuery.isLoading,
    };
}
