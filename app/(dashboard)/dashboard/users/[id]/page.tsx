'use client';

import { use } from 'react';
import { useCustomerDetails } from '@/hooks/use-customers';
import { useBookings } from '@/hooks/use-bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Mail, Phone, Calendar, ArrowLeft, 
    ShieldCheck, PawPrint
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { customer, isLoading } = useCustomerDetails(id);
    const { bookings, isLoading: bookingsLoading } = useBookings({ user_id: id });

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading customer details...</div>;
    if (!customer) return <div className="p-8 text-center text-red-500">Customer not found.</div>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const petColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'name',
            header: 'Pet Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{row.original.name}</span>
                </div>
            )
        },
        {
            accessorKey: 'species_name',
            header: 'Species',
        },
        {
            accessorKey: 'breed',
            header: 'Breed',
        },
        {
            accessorKey: 'life_stage_name',
            header: 'Life Stage',
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Link href={`/dashboard/pets/${row.original.pet_id}`}>
                        <Button variant="ghost" size="sm">View History</Button>
                    </Link>
                </div>
            )
        }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'tier_name',
            header: 'Tier',
            cell: ({ row }) => <Badge variant="outline">{row.original.tier_name}</Badge>
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
                    {(row.original.status as string).toUpperCase()}
                </Badge>
            )
        },
        {
            accessorKey: 'start_date',
            header: 'Start Date',
            cell: ({ row }) => format(new Date(row.original.start_date), 'MMM dd, yyyy')
        },
        {
            accessorKey: 'expiry_date',
            header: 'Expiry Date',
            cell: ({ row }) => row.original.expiry_date ? format(new Date(row.original.expiry_date), 'MMM dd, yyyy') : 'Never'
        }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookingColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'booking_number',
            header: 'Booking #',
            cell: ({ row }) => <span className="font-mono text-xs">{row.original.booking_number}</span>
        },
        {
            accessorKey: 'service_name',
            header: 'Service',
        },
        {
            accessorKey: 'booking_date',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.booking_date), 'MMM dd, yyyy')
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
                        <Button variant="ghost" size="sm">Details</Button>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{customer.full_name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                            {customer.status ? customer.status.toUpperCase() : 'UNKNOWN'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">ID: {id.slice(0, 8)}...</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-none shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Joined {format(new Date(customer.created_at), 'PPP')}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 overflow-hidden border-none shadow-sm">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="px-6 pt-4 border-b">
                            <TabsList className="bg-transparent h-auto p-0 gap-6">
                                <TabsTrigger 
                                    value="overview" 
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0 py-2 h-auto"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="pets"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0 py-2 h-auto"
                                >
                                    Pets ({customer.pets?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="subscriptions"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0 py-2 h-auto"
                                >
                                    Subscriptions
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="bookings"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0 py-2 h-auto"
                                >
                                    Bookings
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Total Pets</p>
                                    <div className="text-2xl font-bold">{customer.pet_count}</div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Active Plan</p>
                                    <div className="text-2xl font-bold text-primary">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {customer.subscriptions?.find((s: any) => s.status === 'active')?.tier_name || 'Free Tier'}
                                    </div>
                                </div>
                            </div>
                            
                            <Card className="bg-muted/50 border-none shadow-none">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Verification Status</p>
                                            <p className="text-xs text-muted-foreground">Email and Phone number verified</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pets" className="p-0 border-t-0">
                            <DataTable 
                                columns={petColumns} 
                                data={customer.pets || []} 
                                isLoading={false} 
                            />
                        </TabsContent>

                        <TabsContent value="subscriptions" className="p-0 border-t-0">
                            <DataTable 
                                columns={subColumns} 
                                data={customer.subscriptions || []} 
                                isLoading={false} 
                            />
                        </TabsContent>

                        <TabsContent value="bookings" className="p-0 border-t-0">
                            <DataTable 
                                columns={bookingColumns} 
                                data={bookings || []} 
                                isLoading={bookingsLoading} 
                            />
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
