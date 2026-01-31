'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/use-payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Search, Filter, CreditCard, ExternalLink, 
    User, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data, isLoading } = useTransactions({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
    });

    const transactions = data?.payments || [];

    const handleViewGateway = (payment: any) => {
        if (!payment.transaction_id) {
            toast.error('No transaction ID available for this payment.');
            return;
        }

        let url = '';
        if (payment.payment_gateway?.toLowerCase() === 'razorpay') {
            url = `https://dashboard.razorpay.com/app/payments/${payment.transaction_id}`;
        } else if (payment.payment_gateway?.toLowerCase() === 'stripe') {
            url = `https://dashboard.stripe.com/payments/${payment.transaction_id}`;
        }

        if (url) {
            window.open(url, '_blank');
        } else {
            toast.error(`Unknown payment gateway: ${payment.payment_gateway}`);
        }
    };

    const columns: ColumnDef<Record<string, any>>[] = [
        {
            accessorKey: 'transaction_id',
            header: 'Transaction ID',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-mono text-xs font-semibold">{row.original.transaction_id || 'N/A'}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{row.original.payment_gateway}</span>
                </div>
            )
        },
        {
            accessorKey: 'owner_name',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded bg-muted flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{row.original.owner_name}</span>
                </div>
            )
        },
        {
            accessorKey: 'invoice_number',
            header: 'Related Invoice',
            cell: ({ row }) => (
                <div className="text-xs font-mono text-primary font-medium">
                    {row.original.invoice_number}
                </div>
            )
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => (
                <div className="font-medium">
                    ₹{parseFloat(row.original.amount).toLocaleString('en-IN')}
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const config: Record<string, { label: string, color: string, icon: any }> = {
                    success: { label: 'Success', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
                    failed: { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
                    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock }
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
            accessorKey: 'payment_date',
            header: 'Date',
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {row.original.payment_date 
                        ? format(new Date(row.original.payment_date), 'MMM dd, HH:mm')
                        : format(new Date(row.original.created_at), 'MMM dd, HH:mm')
                    }
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1.5"
                        onClick={() => handleViewGateway(row.original)}
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Gateway
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Payment Transactions</h1>
                <p className="text-muted-foreground">Real-time log of all payment gateway activity and status verification.</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by transaction ID, invoice #, or customer name..." 
                                className="pl-9 h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable 
                        columns={columns} 
                        data={transactions} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
