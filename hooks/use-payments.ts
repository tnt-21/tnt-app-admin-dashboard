import { useQuery } from '@tanstack/react-query';
import { paymentsAPI } from '@/lib/api/payments';

export const useInvoices = (filters: any = {}) => {
    return useQuery({
        queryKey: ['invoices', filters],
        queryFn: () => paymentsAPI.getAllInvoices(filters)
    });
};

export const useInvoice = (id: string) => {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: () => paymentsAPI.getInvoiceById(id),
        enabled: !!id
    });
};

export const useTransactions = (filters: any = {}) => {
    return useQuery({
        queryKey: ['transactions', filters],
        queryFn: () => paymentsAPI.getAllTransactions(filters)
    });
};

export const useRefunds = (filters: any = {}) => {
    return useQuery({
        queryKey: ['refunds', filters],
        queryFn: () => paymentsAPI.getAllRefunds(filters)
    });
};

export const usePaymentMetrics = () => {
    return useQuery({
        queryKey: ['payment-metrics'],
        queryFn: () => paymentsAPI.getMetrics()
    });
};
