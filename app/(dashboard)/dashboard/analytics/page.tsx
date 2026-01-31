'use client';

import { useState } from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardDescription 
} from '@/components/ui/card';
import { 
    BarChart3, 
    Users, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    ChevronRight,
    Search,
    Download,
    Filter
} from 'lucide-react';
import { 
    useDashboardMetrics, 
    useSubscriptionMetrics, 
    useRevenueBreakdown, 
    useCaregiverPerformance 
} from '@/hooks/use-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    Legend,
    PieChart,
    Pie
} from 'recharts';
import { format, subDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState({
        start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd')
    });

    const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetrics(dateRange);
    const { data: subMetrics, isLoading: isSubLoading } = useSubscriptionMetrics();
    const { data: revenueData, isLoading: isRevenueLoading } = useRevenueBreakdown(dateRange);
    const { data: caregiverPerf, isLoading: isCaregiverLoading } = useCaregiverPerformance({ ...dateRange, limit: 5 });

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
                    <p className="text-gray-600 mt-1">Monitor platform performance and growth trends</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Input 
                            type="date" 
                            className="border-0 p-0 h-8 focus-visible:ring-0 text-sm" 
                            value={dateRange.start_date}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                        <span className="text-gray-400">to</span>
                        <Input 
                            type="date" 
                            className="border-0 p-0 h-8 focus-visible:ring-0 text-sm" 
                            value={dateRange.end_date}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        {isMetricsLoading ? (
                            <Skeleton className="h-7 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">₹{parseFloat(metrics?.summary.total_revenue || '0').toLocaleString()}</div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Current period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        {isMetricsLoading ? (
                            <Skeleton className="h-7 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">{metrics?.summary.avg_active_subscriptions}</div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Average in period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        {isMetricsLoading ? (
                            <Skeleton className="h-7 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">{metrics?.summary.total_bookings}</div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Across all services</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">New Users</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        {isMetricsLoading ? (
                            <Skeleton className="h-7 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">+{metrics?.summary.new_users}</div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Since {format(subDays(new Date(), 30), 'MMM d')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* main Charts Section */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Revenue Trend Line Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Daily revenue performance during the selected period</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {isMetricsLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics?.trends.revenue}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                                    />
                                    <Tooltip 
                                        labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Subscription Distribution Pie Chart */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Subscription Mix</CardTitle>
                        <CardDescription>Active users across tiers</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {isSubLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={subMetrics}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="active"
                                        nameKey="tier_name"
                                    >
                                        {subMetrics?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Breakdown by type */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Sources</CardTitle>
                        <CardDescription>Income distribution by invoice type</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isRevenueLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="invoice_type" 
                                        type="category" 
                                        stroke="#888888" 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [`₹${value}`, 'Amount']}
                                        cursor={{ fill: '#f9fafb' }}
                                    />
                                    <Bar dataKey="total_amount" radius={[0, 4, 4, 0]}>
                                        {revenueData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Top Caregivers Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Top Caregivers</CardTitle>
                            <CardDescription>Performance based on earnings & ratings</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                            View All <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {isCaregiverLoading ? (
                                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                            ) : (
                                caregiverPerf?.map((caregiver) => (
                                    <div key={caregiver.caregiver_id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {caregiver.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{caregiver.full_name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="secondary" className="text-[10px] h-4">
                                                        {caregiver.completed_assignments} bookings
                                                    </Badge>
                                                    <span className="text-xs text-yellow-600 font-medium">★ {caregiver.average_rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">₹{caregiver.total_earnings.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Earnings</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
