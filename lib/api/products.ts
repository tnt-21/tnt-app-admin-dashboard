import { apiClient } from '../api-client';
import type { Product } from '@/types';

export const productsAPI = {
    /**
     * Get all products with optional filters
     */
    getAll: async (filters: { is_active?: boolean; search?: string } = {}): Promise<Product[]> => {
        const response = await apiClient.get('/products', { params: filters });
        // The service returns { products: [], pagination: {} }
        return response.data.data.products;
    },

    /**
     * Get product by ID
     */
    getById: async (id: string): Promise<Product> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data.data;
    },

    /**
     * Create new product
     */
    create: async (data: Partial<Product>): Promise<Product> => {
        const response = await apiClient.post('/products', data);
        return response.data.data;
    },

    /**
     * Update existing product
     */
    update: async (id: string, data: Partial<Product>): Promise<Product> => {
        const response = await apiClient.put(`/products/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete product
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/products/${id}`);
    }
};
