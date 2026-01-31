'use client';

import { useState } from 'react';
import { useInvoices, usePaymentMetrics } from '@/hooks/use-payments';
import { paymentsAPI } from '@/lib/api/payments';
import { generateInvoicePDF } from '@/lib/utils/invoice-pdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Search, Filter, FileText, Download, 
    Eye, User, CreditCard, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';

export default function InvoicesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const { data, isLoading } = useInvoices({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        invoice_type: typeFilter === 'all' ? undefined : typeFilter,
    });

    const { data: metrics } = usePaymentMetrics();

    const invoices = data?.invoices || [];

    const handleExport = () => {
        if (invoices.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['Invoice #', 'Customer', 'Email', 'Type', 'Amount', 'Status', 'Due Date'];
        const csvRows = [
            headers.join(','),
            ...invoices.map((inv: any) => [
                inv.invoice_number,
                `"${inv.owner_name}"`,
                inv.owner_email,
                inv.invoice_type,
                inv.total_amount,
                inv.status,
                format(new Date(inv.due_date), 'yyyy-MM-dd')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `invoices_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Invoices exported successfully');
    };

    const handleDownload = async (invoice: any) => {
        try {
            toast.loading(`Preparing PDF for ${invoice.invoice_number}...`, { id: 'download' });
            
            // Fetch detailed invoice including line items for the PDF
            const detailedInvoice = await paymentsAPI.getInvoiceById(invoice.invoice_id);
            
            generateInvoicePDF(detailedInvoice);
            
            toast.success('Invoice PDF generated', { id: 'download' });
        } catch (error) {
            toast.error('Failed to generate PDF', { id: 'download' });
        }
    };

    const columns: ColumnDef<Record<string, any>>[] = [
        {
            accessorKey: 'invoice_number',
            header: 'Invoice #',
            cell: ({ row }) => (
                <div className="font-mono text-xs font-semibold text-primary">
                    {row.original.invoice_number}
                </div>
            )
        },
        {
            accessorKey: 'owner_name',
            header: 'Customer',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.original.owner_name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.owner_email}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'invoice_type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="secondary" className="capitalize">
                    {row.original.invoice_type}
                </Badge>
            )
        },
        {
            accessorKey: 'total_amount',
            header: 'Amount',
            cell: ({ row }) => (
                <div className="font-medium">
                    ₹{parseFloat(row.original.total_amount).toLocaleString('en-IN')}
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<string, string> = {
                    paid: 'bg-green-100 text-green-700 border-green-200',
                    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    overdue: 'bg-red-100 text-red-700 border-red-200',
                    cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
                };
                
                return (
                    <Badge 
                        variant="outline" 
                        className={`capitalize font-medium ${variants[status] || 'bg-blue-100 text-blue-700 border-blue-200'}`}
                    >
                        {status}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'due_date',
            header: 'Due Date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(row.original.due_date), 'MMM dd, yyyy')}
                </span>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/payments/invoices/${row.original.invoice_id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary"
                        onClick={() => handleDownload(row.original)}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage and track all customer billing and subscriptions.</p>
                </div>
                <div className="flex items-center gap-3 no-print">
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button className="gap-2" disabled>
                        <FileText className="h-4 w-4" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                <Card className="border-none shadow-sm bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{parseFloat(metrics?.total_revenue || 0).toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total collected funds</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-yellow-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">₹{parseFloat(metrics?.outstanding_amount || 0).toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending & Overdue</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Paid Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{metrics?.paid_count || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by invoice # or customer name..." 
                                className="pl-9 h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px] h-10">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[150px] h-10">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="subscription">Subscription</SelectItem>
                                    <SelectItem value="booking">Booking</SelectItem>
                                    <SelectItem value="addon">Addon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable 
                        columns={columns} 
                        data={invoices} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
