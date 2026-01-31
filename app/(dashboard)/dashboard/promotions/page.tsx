'use client';

import { useState } from 'react';
import { usePromoCodes, useDeletePromoCode } from '@/hooks/use-promo';
import { useReferralStats, useAllReferrals } from '@/hooks/use-referral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Plus, Search, Gift, 
    TrendingUp, Users, Ticket,
    MoreHorizontal, Edit, Trash2,
    Calendar, CheckCircle2, XCircle
} from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { 
    DropdownMenu, DropdownMenuContent, 
    DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { PromoDialog } from '@/components/dialogs/promo-dialog';

export default function PromotionsPage() {
    const [activeTab, setActiveTab] = useState('promo-codes');
    const { data: promoData, isLoading: isLoadingPromos } = usePromoCodes();
    const { data: referralStats } = useReferralStats();
    const { data: referralData, isLoading: isLoadingReferrals } = useAllReferrals();
    
    const deletePromo = useDeletePromoCode();

    const promoCodes = promoData?.promo_codes || [];
    const referrals = referralData?.referrals || [];

    const promoColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'promo_code',
            header: 'Code',
            cell: ({ row }) => <span className="font-mono font-bold text-blue-600">{row.original.promo_code}</span>
        },
        {
            accessorKey: 'promo_name',
            header: 'Campaign Name'
        },
        {
            accessorKey: 'discount_value',
            header: 'Discount',
            cell: ({ row }) => (
                <span>
                    {row.original.discount_type === 'percentage' ? `${row.original.discount_value}%` : `₹${row.original.discount_value}`}
                </span>
            )
        },
        {
            accessorKey: 'current_uses',
            header: 'Uses',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.current_uses} / {row.original.max_uses_total || '∞'}</span>
                    <div className="w-full bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div 
                            className="bg-blue-500 h-full" 
                            style={{ width: `${(row.original.current_uses / (row.original.max_uses_total || 100)) * 100}%` }}
                        />
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'} className={row.original.is_active ? "bg-green-500" : ""}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            accessorKey: 'valid_until',
            header: 'Expiry',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(row.original.valid_until), 'MMM dd, yyyy')}
                </div>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <PromoDialog initialData={row.original}>
                            <DropdownMenuItem className="gap-2" onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                        </PromoDialog>
                        <DropdownMenuItem 
                            className="gap-2 text-red-600"
                            onClick={() => {
                                if (confirm('Are you sure you want to deactivate/delete this promo code?')) {
                                    deletePromo.mutate(row.original.promo_id);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" /> Deactivate
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const referralColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'referrer_name',
            header: 'Referrer',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{row.original.referrer_name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{row.original.referrer_phone}</span>
                </div>
            )
        },
        {
            accessorKey: 'referred_name',
            header: 'New User',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{row.original.referred_name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{row.original.referred_phone}</span>
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    completed: 'bg-green-100 text-green-700 border-green-200',
                    reward_issued: 'bg-blue-100 text-blue-700 border-blue-200'
                };
                return (
                    <Badge variant="outline" className={`capitalize ${variants[status]}`}>
                        {status?.replace('_', ' ')}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.created_at), 'MMM dd, yyyy')
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Promotions & Referrals</h1>
                    <p className="text-muted-foreground">Manage promo codes and track user acquisition via referrals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Campaign Report
                    </Button>
                    <PromoDialog>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Campaign
                        </Button>
                    </PromoDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-600">Total Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referralStats?.total_referrals || 0}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-[10px] text-green-600 font-medium">+12% from last month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-purple-600">Active Promos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{promoCodes.filter((p: any) => p.is_active).length}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Across 3 categories</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white">
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-orange-600">Referral Conversion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {referralStats?.total_referrals > 0 
                                ? Math.round((referralStats.successful_referrals / referralStats.total_referrals) * 100) 
                                : 0}%
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Pending to Completed</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-green-600">Rewards Issued</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{referralStats?.total_rewards_issued || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Platform credits issued</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="promo-codes" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-white border p-1 h-10">
                        <TabsTrigger value="promo-codes" className="gap-2 text-xs h-8 px-4">
                            <Ticket className="h-3.5 w-3.5" />
                            Promo Codes
                        </TabsTrigger>
                        <TabsTrigger value="referrals" className="gap-2 text-xs h-8 px-4">
                            <Users className="h-3.5 w-3.5" />
                            Referrals
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                <TabsContent value="promo-codes" className="mt-0">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <DataTable 
                            columns={promoColumns} 
                            data={promoCodes} 
                            isLoading={isLoadingPromos} 
                        />
                    </Card>
                </TabsContent>

                <TabsContent value="referrals" className="mt-0">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <DataTable 
                            columns={referralColumns} 
                            data={referrals} 
                            isLoading={isLoadingReferrals} 
                        />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
