'use client';

import { useState } from 'react';
import { useRefunds } from '@/hooks/use-payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Filter, RefreshCcw, CheckCircle2, 
    XCircle, Clock, Ban, User, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function RefundsPage() {
    const [statusFilter, setStatusFilter] = useState('all');

    const { data, isLoading, refetch } = useRefunds({
        status: statusFilter === 'all' ? undefined : statusFilter,
    });

    const refunds = data || [];

    const columns: ColumnDef<Record<string, any>>[] = [
        {
            accessorKey: 'refund_id',
            header: 'Refund Details',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{row.original.refund_id.slice(0, 8)}...</span>
                    <span className="text-sm font-medium">{row.original.reason || 'No reason provided'}</span>
                </div>
            )
        },
        {
            accessorKey: 'owner_name',
            header: 'Customer',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{row.original.owner_name}</span>
                </div>
            )
        },
        {
            accessorKey: 'invoice_number',
            header: 'Source Invoice',
            cell: ({ row }) => (
                <div className="text-xs font-mono font-medium text-primary">
                    {row.original.invoice_number}
                </div>
            )
        },
        {
            accessorKey: 'refund_amount',
            header: 'Refund Amt',
            cell: ({ row }) => (
                <div className="font-semibold text-red-600">
                    ₹{parseFloat(row.original.refund_amount).toLocaleString('en-IN')}
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const config: Record<string, { label: string, color: string, icon: any }> = {
                    processed: { label: 'Processed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
                    failed: { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200', icon: Ban },
                    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
                    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle }
                };
                
                const item = config[status] || config.pending;
                const Icon = item.icon;

                return (
                    <Badge variant="outline" className={`gap-1.5 px-2 py-0.5 ${item.color}`}>
                        <Icon className="h-3 w-3" />
                        {item.label}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'created_at',
            header: 'Requested On',
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button variant="outline" size="sm" className="h-8">
                        Process
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Refund Management</h1>
                    <p className="text-muted-foreground">Review and process refund requests from customers and care managers.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending</span>
                    <span className="text-2xl font-bold">0</span>
                </div>
                <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Processed (MTD)</span>
                    <span className="text-2xl font-bold">₹0</span>
                </div>
                <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg. Time</span>
                    <span className="text-2xl font-bold">--</span>
                </div>
                <div className="border rounded-lg p-4 bg-primary/5 flex items-center justify-between border-primary/20">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Quick Action</span>
                        <span className="text-sm font-medium">Auto-Refund Policy</span>
                    </div>
                    <Button variant="link" size="icon" className="text-primary hover:bg-primary/10">
                        <Info className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] h-10">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="All Statuses" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processed">Processed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable 
                        columns={columns} 
                        data={refunds} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
