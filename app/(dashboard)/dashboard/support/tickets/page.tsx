'use client';

import { useState } from 'react';
import { useSupportTickets, useSupportMetrics } from '@/hooks/use-support';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Search, Filter, Headphones, 
    Clock, AlertCircle, CheckCircle2,
    Eye, MoreHorizontal, User,
    ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function SupportTicketsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const { data, isLoading } = useSupportTickets({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
    });

    const { data: metrics } = useSupportMetrics();

    const tickets = data?.tickets || [];
    
    const columns: ColumnDef<Record<string, any>>[] = [
        {
            accessorKey: 'ticket_number',
            header: 'Ticket #',
            cell: ({ row }) => (
                <span className="font-mono font-bold text-blue-600">{row.original.ticket_number}</span>
            )
        },
        {
            accessorKey: 'subject',
            header: 'Subject & User',
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[300px]">
                    <span className="text-sm font-semibold truncate">{row.original.subject}</span>
                    <span className="text-xs text-muted-foreground truncate">{row.original.user_name} ({row.original.user_email})</span>
                </div>
            )
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => (
                <Badge variant="secondary" className="capitalize text-[10px]">
                    {row.original.category?.replace('_', ' ')}
                </Badge>
            )
        },
        {
            accessorKey: 'priority',
            header: 'Priority',
            cell: ({ row }) => {
                const priority = row.original.priority;
                const variants: Record<string, string> = {
                    urgent: 'bg-red-100 text-red-700 border-red-200',
                    high: 'bg-orange-100 text-orange-700 border-orange-200',
                    medium: 'bg-blue-100 text-blue-700 border-blue-200',
                    low: 'bg-gray-100 text-gray-700 border-gray-200'
                };
                return (
                    <Badge variant="outline" className={`capitalize font-medium ${variants[priority]}`}>
                        {priority}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<string, string> = {
                    open: 'bg-green-100 text-green-700 border-green-200',
                    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
                    waiting_customer: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    resolved: 'bg-purple-100 text-purple-700 border-purple-200',
                    closed: 'bg-gray-100 text-gray-700 border-gray-200'
                };
                return (
                    <Badge variant="outline" className={`capitalize font-medium ${variants[status]}`}>
                        {status?.replace('_', ' ')}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'assigned_to_name',
            header: 'Assignee',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-400" />
                    </div>
                    <span className="text-sm truncate max-w-[100px]">
                        {row.original.assigned_to_name || 'Unassigned'}
                    </span>
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/support/tickets/${row.original.ticket_id}`}>
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
                    <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                    <p className="text-muted-foreground">Manage customer inquiries and support requests.</p>
                </div>
                <Button className="gap-2 shadow-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    Knowledge Base
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open Tickets</CardTitle>
                            <AlertCircle className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.open_tickets || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Requiring first response</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.in_progress_tickets || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Currently being handled</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Urgent/High</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.high_priority_tickets || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">High priority workload</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2 space-y-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg. Response</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.avg_response_time_hours || 0}h</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Response time SLA: 4h</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by ticket #, subject or user..." 
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
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="waiting_customer">Waiting</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[140px] h-10 border-gray-100 font-medium">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 border-t border-gray-50">
                    <DataTable 
                        columns={columns} 
                        data={tickets} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
