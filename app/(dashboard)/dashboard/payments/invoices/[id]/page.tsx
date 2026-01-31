'use client';

import { use, useState } from 'react';
import { useInvoice } from '@/hooks/use-payments';
import { paymentsAPI } from '@/lib/api/payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    FileText, Calendar, User, CreditCard, 
    ArrowLeft, Download, Clock, CheckCircle2,
    AlertCircle, Printer, Mail, Send, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { generateInvoicePDF } from '@/lib/utils/invoice-pdf';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: invoice, isLoading } = useInvoice(id);

    const handleDownload = async () => {
        if (!invoice) return;
        try {
            toast.loading(`Preparing PDF download...`, { id: 'download' });
            generateInvoicePDF(invoice);
            toast.success('Invoice PDF generated', { id: 'download' });
        } catch (error) {
            toast.error('Failed to download invoice', { id: 'download' });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading invoice details...</div>;
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found.</div>;

    const statusColors: Record<string, string> = {
        paid: 'bg-green-100 text-green-700 border-green-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        overdue: 'bg-red-100 text-red-700 border-red-200',
        cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
        <div className="space-y-6 print-area">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/payments/invoices" className="no-print">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">Invoice #{invoice.invoice_number}</h1>
                            <Badge variant="outline" className={`capitalize ${statusColors[invoice.status] || ''}`}>
                                {invoice.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Issued on {format(new Date(invoice.created_at), 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" disabled>
                        <Mail className="h-4 w-4" />
                        Email
                    </Button>
                    <Button 
                        size="sm" 
                        className="gap-2"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6 invoice-container">
                    {/* Invoice Details */}
                    <Card className="border-none shadow-sm overflow-hidden card print:border print:border-gray-200">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle>Invoice Summary</CardTitle>
                                    <p className="text-sm text-muted-foreground">Detailed breakdown of charges and items.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Due Date</p>
                                    <p className="text-lg font-bold text-primary">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Description</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead className="text-right pr-6">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.line_items?.map((item: any) => (
                                        <TableRow key={item.line_item_id}>
                                            <TableCell className="pl-6 font-medium">{item.description}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right pr-6 font-semibold">
                                                ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            <div className="p-6 bg-muted/10 border-t">
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>₹{parseFloat(invoice.subtotal).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax ({invoice.tax_percentage}%)</span>
                                            <span>₹{parseFloat(invoice.tax_amount).toLocaleString('en-IN')}</span>
                                        </div>
                                        {parseFloat(invoice.discount_amount) > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount</span>
                                                <span>-₹{parseFloat(invoice.discount_amount).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary">₹{parseFloat(invoice.total_amount).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction History for this Invoice */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {invoice.payments?.map((payment: any) => (
                                    <div key={payment.payment_id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                payment.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                {payment.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{payment.transaction_id || 'Internal Transaction'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(payment.created_at), 'PPP')} via {payment.payment_method_used || payment.payment_gateway}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                                            <Badge variant="ghost" className={`text-[10px] uppercase ${
                                                payment.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {(!invoice.payments || invoice.payments.length === 0) && (
                                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                        <Clock className="h-8 w-8 text-muted-foreground/20" />
                                        <p className="text-sm italic">No payment attempts found for this invoice.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Bill To
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold">{invoice.owner_name}</p>
                                    <Link href={`/dashboard/users/${invoice.user_id}`} className="text-xs text-primary hover:underline">
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{invoice.owner_email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Send className="h-4 w-4" />
                                    <span>{invoice.owner_phone}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Entities */}
                    {(invoice.booking_id || invoice.subscription_id) && (
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Related Reference</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {invoice.booking_id && (
                                    <Link href={`/dashboard/bookings/${invoice.booking_id}`}>
                                        <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-muted-foreground">Booking Delivery</span>
                                                <span className="text-sm font-bold">View Appointment</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                    </Link>
                                )}
                                {invoice.subscription_id && (
                                    <div className="p-3 rounded-lg border flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted-foreground">Subscription Plan</span>
                                            <span className="text-sm font-bold">Active Member</span>
                                        </div>
                                        <Badge>Recurring</Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
