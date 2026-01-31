'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Search, Filter, Plus, Calendar, 
    Users, MapPin, Eye, MoreHorizontal,
    Trophy, Users2, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { EventForm } from '@/components/community/event-form';
import { useEvents, useCommunityMetrics } from '@/hooks/use-community';

export default function EventsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data, isLoading } = useEvents({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        event_type: typeFilter === 'all' ? undefined : typeFilter,
    });

    const { data: metrics } = useCommunityMetrics();

    const events = data?.events || [];
    const pagination = data?.pagination || {};

    const columns: ColumnDef<Record<string, any>>[] = [
        {
            accessorKey: 'title',
            header: 'Event Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">{row.original.title}</span>
                        <span className="text-xs text-muted-foreground capitalize">{row.original.event_type}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'event_date',
            header: 'Date & Time',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {format(new Date(row.original.event_date), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.event_time.slice(0, 5)}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'location_name',
            header: 'Location',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">{row.original.location_name || 'TBD'}</span>
                </div>
            )
        },
        {
            accessorKey: 'actual_participants',
            header: 'Capacity',
            cell: ({ row }) => {
                const current = parseInt(row.original.actual_participants || 0);
                const max = parseInt(row.original.max_participants || 0);
                const percentage = Math.round((current / max) * 100);
                
                return (
                    <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px] font-medium">
                            <span>{current}/{max}</span>
                            <span>{percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                            <div 
                                className={`h-full rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-orange-500' : 'bg-primary'}`} 
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<string, string> = {
                    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
                    completed: 'bg-green-100 text-green-700 border-green-200',
                    cancelled: 'bg-red-100 text-red-700 border-red-200',
                    ongoing: 'bg-orange-100 text-orange-700 border-orange-200'
                };
                
                return (
                    <Badge 
                        variant="outline" 
                        className={`capitalize font-medium ${variants[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                    >
                        {status}
                    </Badge>
                );
            }
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/community/events/${row.original.event_id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Community Events</h1>
                    <p className="text-muted-foreground">Manage socialization sessions, workshops, and meetups.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-sm">
                                <Plus className="h-4 w-4" />
                                New Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Event</DialogTitle>
                                <DialogDescription>Fill in the details below to publish a new community event.</DialogDescription>
                            </DialogHeader>
                            <EventForm 
                                onSuccess={() => setIsCreateDialogOpen(false)} 
                                onCancel={() => setIsCreateDialogOpen(false)} 
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.upcoming_count || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Confirmed next 30 days</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participants</CardTitle>
                            <Users2 className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.total_participants || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Total active registrations</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg. Fill Rate</CardTitle>
                            <Trophy className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.avg_fill_rate || 0}%</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Waitlist active on {metrics?.events_with_waitlist || 0} events</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Waitlist</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.total_waitlist || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Users waiting for spots</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search events..." 
                                className="pl-9 h-10 border-gray-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] h-10 border-gray-100">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[140px] h-10 border-gray-100 font-medium">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="socialization">Socialization</SelectItem>
                                    <SelectItem value="workshop">Workshop</SelectItem>
                                    <SelectItem value="meetup">Meetup</SelectItem>
                                    <SelectItem value="training">Training</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 border-t border-gray-50">
                    <DataTable 
                        columns={columns} 
                        data={events} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
