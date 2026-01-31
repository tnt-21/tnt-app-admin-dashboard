import { apiClient as api } from '../api-client';

export const paymentsAPI = {
    // Global Invoices
    getAllInvoices: async (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.invoice_type) params.append('invoice_type', filters.invoice_type);
        if (filters.from_date) params.append('from_date', filters.from_date);
        if (filters.to_date) params.append('to_date', filters.to_date);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/admin/payments/invoices?${params.toString()}`);
        return response.data.data;
    },

    getInvoiceById: async (id: string) => {
        const response = await api.get(`/admin/payments/invoices/${id}`);
        return response.data.data;
    },

    // Global Transactions
    getAllTransactions: async (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.from_date) params.append('from_date', filters.from_date);
        if (filters.to_date) params.append('to_date', filters.to_date);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/admin/payments/transactions?${params.toString()}`);
        return response.data.data;
    },

    // Global Refunds
    getAllRefunds: async (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);

        const response = await api.get(`/admin/payments/refunds?${params.toString()}`);
        return response.data.data;
    },

    // Metrics
    getMetrics: async () => {
        const response = await api.get('/admin/payments/metrics');
        return response.data.data;
    },

    // Downloads
    downloadInvoice: async (id: string) => {
        const response = await api.get(`/admin/payments/invoices/${id}`);
        return response.data.data;
    }
};
