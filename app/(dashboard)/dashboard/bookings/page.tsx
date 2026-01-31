'use client';

import { useState } from 'react';
import { useBookings } from '@/hooks/use-bookings';
import { useBookingStatuses } from '@/hooks/use-booking-statuses';
import { useServiceCategories } from '@/hooks/use-service-categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Select, SelectContent,SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Search, Filter, Calendar as CalendarIcon, 
    List, MoreHorizontal, Eye, User, PawPrint
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function BookingsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    const { bookings, isLoading, pagination } = useBookings({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category_id: categoryFilter === 'all' ? undefined : categoryFilter,
    });

    const { statuses } = useBookingStatuses();
    const { categories } = useServiceCategories();

    const columns: ColumnDef<Record<string, any>>[] = [
        {
            accessorKey: 'booking_number',
            header: 'Booking #',
            cell: ({ row }) => (
                <div className="font-mono text-xs font-medium">
                    {row.original.booking_number}
                </div>
            )
        },
        {
            accessorKey: 'customer',
            header: 'Customer & Pet',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {row.original.owner_name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <PawPrint className="h-3 w-3" />
                        {row.original.pet_name}
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'service_name',
            header: 'Service',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.service_name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.category_name}</span>
                </div>
            )
        },
        {
            accessorKey: 'booking_date',
            header: 'Schedule',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{format(new Date(row.original.booking_date), 'MMM dd, yyyy')}</span>
                    <span className="text-xs text-muted-foreground">{row.original.booking_time}</span>
                </div>
            )
        },
        {
            accessorKey: 'status_name',
            header: 'Status',
            cell: ({ row }) => (
                <Badge 
                    style={{ 
                        backgroundColor: (row.original.status_color || '#cccccc') + '20', 
                        color: row.original.status_color || '#666666',
                        borderColor: (row.original.status_color || '#cccccc') + '40'
                    }}
                    variant="outline"
                >
                    {row.original.status_name}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Link href={`/dashboard/bookings/${row.original.booking_id}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                            <Eye className="h-4 w-4" />
                            Details
                        </Button>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Booking Operations</h1>
                    <p className="text-muted-foreground">Manage all service deliveries and caregivers assignments.</p>
                </div>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                    <Button 
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setViewMode('list')}
                        className="h-8 px-3"
                    >
                        <List className="h-4 w-4 mr-2" />
                        List
                    </Button>
                    <Button 
                        variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setViewMode('calendar')}
                        className="h-8 px-3"
                    >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Calendar
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by booking #, customer or pet..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="All Statuses" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {statuses?.map((status: Record<string, any>) => (
                                        <SelectItem key={status.status_id} value={status.status_code}>
                                            {status.status_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories?.map((cat: Record<string, any>) => (
                                        <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                                            {cat.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {viewMode === 'list' ? (
                        <DataTable 
                            columns={columns} 
                            data={bookings || []} 
                            isLoading={isLoading} 
                        />
                    ) : (
                        <div className="p-12 text-center">
                            <CalendarIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Calendar View Coming Soon</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">We are currently integrating a high-performance interactive calendar for booking management.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
