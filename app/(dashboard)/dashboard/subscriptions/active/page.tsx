'use client';

import { useState } from 'react';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useSubscriptionTiers } from '@/hooks/use-subscription-tiers';
import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, User, PawPrint, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';

export default function ActiveSubscriptionsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [tierId, setTierId] = useState<string>('all');

    const filters = {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        tierId: tierId === 'all' ? undefined : parseInt(tierId),
    };

    const { subscriptions, isLoading } = useSubscriptions(filters);
    const { tiers } = useSubscriptionTiers();

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'customer_name',
            header: 'Customer',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.customer_name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.customer_phone}</span>
                </div>
            ),
        },
        {
            accessorKey: 'pet_name',
            header: 'Pet',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.pet_photo ? (
                        <img src={row.original.pet_photo} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex flex-col">
                        <span>{row.original.pet_name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.species_name}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'tier_name',
            header: 'Plan',
            cell: ({ row }) => (
                <Badge 
                    variant="outline" 
                    style={{ 
                        borderColor: row.original.color_hex, 
                        color: row.original.color_hex,
                        backgroundColor: `${row.original.color_hex}10`
                    }}
                >
                    {row.original.tier_name}
                </Badge>
            ),
        },
        {
            accessorKey: 'billing_cycle',
            header: 'Cycle',
            cell: ({ row }) => <span className="capitalize">{row.original.cycle_name}</span>,
        },
        {
            accessorKey: 'next_billing',
            header: 'Next Billing',
            cell: ({ row }) => format(new Date(row.original.next_billing_date), 'MMM dd, yyyy'),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const s = row.original.status;
                return (
                    <Badge variant={s === 'active' ? 'default' : s === 'paused' ? 'secondary' : 'destructive'}>
                        {s.toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Price</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium">
                    ₹{Number(row.original.final_price).toLocaleString()}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Active Subscriptions</h1>
                <p className="text-gray-600 mt-1">Monitor and manage all customer membership plans</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subscriptions.filter((s:any) => s.status === 'active').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (MRR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{subscriptions
                                .filter((s:any) => s.status === 'active')
                                .reduce((acc: number, s: any) => acc + (s.cycle_name === 'monthly' ? Number(s.final_price) : Number(s.final_price)/12), 0)
                                .toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {subscriptions.filter((s:any) => {
                                const days = (new Date(s.next_billing_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                                return days > 0 && days < 7;
                            }).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Churn Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {subscriptions.filter((s:any) => !s.auto_renew).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search customer, phone or pet..." 
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={tierId.toString()} onValueChange={setTierId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Tiers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tiers</SelectItem>
                                    {tiers.map(t => (
                                        <SelectItem key={t.tier_id} value={t.tier_id.toString()}>{t.tier_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="paused">Paused</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DataTable 
                        columns={columns} 
                        data={subscriptions} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
