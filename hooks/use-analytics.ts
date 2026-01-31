'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, type AnalyticsFilters } from '@/lib/api/analytics';

export function useDashboardMetrics(filters: AnalyticsFilters = {}) {
    return useQuery({
        queryKey: ['analytics', 'dashboard', filters],
        queryFn: () => analyticsAPI.getDashboard(filters),
    });
}

export function useSubscriptionMetrics() {
    return useQuery({
        queryKey: ['analytics', 'subscriptions'],
        queryFn: () => analyticsAPI.getSubscriptions(),
    });
}

export function useRevenueBreakdown(filters: AnalyticsFilters = {}) {
    return useQuery({
        queryKey: ['analytics', 'revenue', filters],
        queryFn: () => analyticsAPI.getRevenue(filters),
    });
}

export function useCaregiverPerformance(filters: AnalyticsFilters & { limit?: number } = {}) {
    return useQuery({
        queryKey: ['analytics', 'caregivers', filters],
        queryFn: () => analyticsAPI.getCaregivers(filters),
    });
}

export function useReport(type: string, filters: AnalyticsFilters = {}) {
    return useQuery({
        queryKey: ['analytics', 'report', type, filters],
        queryFn: () => analyticsAPI.getReport(type, filters),
        enabled: !!type
    });
}
