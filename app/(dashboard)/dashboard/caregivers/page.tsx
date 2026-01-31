'use client';

import { useState } from 'react';
import { useCaregivers, useCaregiverMutations } from '@/hooks/use-caregivers';
import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, UserCog, Star, MapPin, Briefcase, Plus, MoreHorizontal } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CaregiversPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');

    const { caregivers, isLoading, refetch } = useCaregivers({
        search: search || undefined,
        status: status === 'all' ? undefined : status,
    });

    const { deleteCaregiver } = useCaregiverMutations();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to deactivate this caregiver?')) {
            await deleteCaregiver(id);
            refetch();
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'full_name',
            header: 'Caregiver',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
                        <UserCog className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.original.full_name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.email}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{row.original.rating || 'N/A'}</span>
                </div>
            ),
        },
        {
            accessorKey: 'city',
            header: 'Location',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {row.original.city || 'Not Specified'}
                </div>
            ),
        },
        {
            accessorKey: 'specializations',
            header: 'Specializations',
            cell: ({ row }) => {
                const specs = row.original.specializations || [];
                if (specs.length === 0) return <span className="text-muted-foreground italic text-xs">None</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {specs.slice(0, 2).map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0">{s}</Badge>
                        ))}
                        {specs.length > 2 && <span className="text-[10px] text-muted-foreground">+{specs.length - 2} more</span>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'experience_years',
            header: 'Experience',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-gray-600">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{row.original.experience_years || 0} Yrs</span>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
                    {row.original.status.toUpperCase()}
                </Badge>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/caregivers/${row.original.caregiver_id}`)}>
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>Manage Availability</DropdownMenuItem>
                            <DropdownMenuItem>View Earnings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(row.original.caregiver_id)}
                            >
                                Deactivate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Caregivers</h1>
                    <p className="text-gray-600 mt-1">Manage and monitor service providers across the platform</p>
                </div>
                <Link href="/dashboard/caregivers/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 font-medium">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Caregiver
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Caregivers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{caregivers.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Providers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {caregivers.filter((c: any) => c.status === 'active').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-1 text-yellow-600">
                             <Star className="h-5 w-5 fill-yellow-600" />
                             {caregivers.length > 0 
                                ? (caregivers.reduce((acc: number, c: any) => acc + (parseFloat(c.rating) || 0), 0) / caregivers.length).toFixed(1) 
                                : '0.0'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                             {caregivers.filter((c: any) => c.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email or specialization..." 
                                className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-all shadow-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[180px] bg-white border-gray-200 shadow-none">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending Review</SelectItem>
                                    <SelectItem value="terminated">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DataTable 
                        columns={columns} 
                        data={caregivers} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
