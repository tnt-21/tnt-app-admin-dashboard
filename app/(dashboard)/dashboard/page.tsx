'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { analyticsAPI } from '@/lib/api/analytics';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: () => analyticsAPI.getDashboard(),
        refetchInterval: 300000, 
    });

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">
                <p>Failed to load dashboard data. Please try again later.</p>
                <p className="text-sm mt-2">{(error as Error).message}</p>
            </div>
        );
    }

    const { summary, trends } = dashboardData || {};

    const stats = [
        {
            title: 'Total Revenue',
            value: formatCurrency(parseFloat(summary?.total_revenue || '0')),
            change: 'Last 30 days',
            trend: 'up' as const,
            icon: DollarSign,
        },
        {
            title: 'Avg Active Subscriptions',
            value: summary?.avg_active_subscriptions?.toString() || '0',
            change: 'Daily Average',
            trend: 'up' as const,
            icon: Users,
        },
        {
            title: 'Total Bookings',
            value: summary?.total_bookings?.toString() || '0',
            change: 'Last 30 days',
            trend: 'up' as const,
            icon: Calendar,
        },
        {
            title: 'New Users',
            value: summary?.new_users?.toString() || '0',
            change: `Total: ${summary?.total_users}`,
            trend: 'up' as const,
            icon: Users,
        },
    ];

    const revenueData = trends?.revenue || [];
    const bookingsData = trends?.bookings || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">overview of platform performance (Last 30 Days)</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 h-[200px] overflow-y-auto">
                           {revenueData.length > 0 ? (
                                revenueData.slice(0, 5).map((point: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm p-2 border-b">
                                        <span>{new Date(point.date).toLocaleDateString()}</span>
                                        <span className="font-mono">{formatCurrency(point.value)}</span>
                                    </div>
                                ))
                           ) : (
                               <div className="text-center text-gray-500 py-10">No revenue data available</div>
                           )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Booking Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-2 h-[200px] overflow-y-auto">
                           {bookingsData.length > 0 ? (
                                bookingsData.filter((b:any) => b.value > 0).slice(0, 5).map((point: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm p-2 border-b">
                                        <span>{new Date(point.date).toLocaleDateString()}</span>
                                        <span className="font-mono">{point.value} Bookings</span>
                                    </div>
                                ))
                           ) : (
                               <div className="text-center text-gray-500 py-10">No booking data available</div>
                           )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[300px]" />
             </div>
        </div>
    );
}
