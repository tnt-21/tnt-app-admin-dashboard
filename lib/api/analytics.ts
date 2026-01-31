import { apiClient } from '../api-client';
import type {
    DashboardMetrics,
    SubscriptionMetric,
    RevenueBreakdown,
    CaregiverPerformance
} from '@/types';

export interface AnalyticsFilters {
    start_date?: string;
    end_date?: string;
}

export const analyticsAPI = {
    /**
     * Get high-level dashboard metrics and trends
     */
    getDashboard: async (filters: AnalyticsFilters = {}): Promise<DashboardMetrics> => {
        const response = await apiClient.get<DashboardMetrics>('/analytics/dashboard', { params: filters });
        return response.data.data;
    },

    /**
     * Get detailed subscription metrics
     */
    getSubscriptions: async (): Promise<SubscriptionMetric[]> => {
        const response = await apiClient.get<{ metrics: SubscriptionMetric[] }>('/analytics/subscriptions');
        return response.data.data.metrics;
    },

    /**
     * Get revenue breakdown by invoice type
     */
    getRevenue: async (filters: AnalyticsFilters = {}): Promise<RevenueBreakdown[]> => {
        const response = await apiClient.get<{ breakdown: RevenueBreakdown[] }>('/analytics/revenue', { params: filters });
        return response.data.data.breakdown;
    },

    /**
     * Get caregiver performance rankings and metrics
     */
    getCaregivers: async (filters: AnalyticsFilters & { limit?: number } = {}): Promise<CaregiverPerformance[]> => {
        const response = await apiClient.get<{ caregivers: CaregiverPerformance[] }>('/analytics/caregivers', { params: filters });
        return response.data.data.caregivers;
    },

    /**
     * Get general report data based on type
     */
    getReport: async (type: string, filters: AnalyticsFilters = {}): Promise<any> => {
        const response = await apiClient.get('/analytics/reports', {
            params: { ...filters, type }
        });
        return response.data.data;
    }
};
