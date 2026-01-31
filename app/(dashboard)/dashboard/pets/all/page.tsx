'use client';

import { useState } from 'react';
import { usePets } from '@/hooks/use-pets';
import { useSubscriptionTiers } from '@/hooks/use-subscription-tiers';
import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, PawPrint, User, Hash, Info, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';

export default function GlobalPetsPage() {
    const [search, setSearch] = useState('');
    const [speciesId, setSpeciesId] = useState<string>('all');

    const { pets, isLoading, pagination } = usePets({
        search: search || undefined,
        species_id: speciesId === 'all' ? undefined : parseInt(speciesId),
    });

    const { tiers } = useSubscriptionTiers(); // For potential filtering/info

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'name',
            header: 'Pet Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center">
                        <PawPrint className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.breed || 'Unknown Breed'}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'species_name',
            header: 'Species',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.species_name}</Badge>
            ),
        },
        {
            accessorKey: 'owner_name',
            header: 'Owner',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        <User className="h-3 w-3" />
                        {row.original.owner_name}
                    </div>
                    <span className="text-xs text-muted-foreground ml-4.5">{row.original.owner_phone}</span>
                </div>
            ),
        },
        {
            accessorKey: 'life_stage_name',
            header: 'Life Stage',
            cell: ({ row }) => row.original.life_stage_name,
        },
        {
            accessorKey: 'microchip_id',
            header: 'Microchip ID',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 font-mono text-xs">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    {row.original.microchip_id || 'Not Assigned'}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4 mr-2" />
                        View History
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Global Pet Inventory</h1>
                    <p className="text-gray-600 mt-1">Overview of all pets registered across the platform</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Pet
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Dogs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                             {pets.filter((p:any) => p.species_name?.toLowerCase() === 'dog').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                             {pets.filter((p:any) => p.species_name?.toLowerCase() === 'cat').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Registrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {pets.filter((p:any) => {
                                const days = (new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 3600 * 24);
                                return days < 7;
                            }).length}
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
                                placeholder="Search by pet name, microchip ID or owner name..." 
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={speciesId} onValueChange={setSpeciesId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Species" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Species</SelectItem>
                                    <SelectItem value="1">Dog</SelectItem>
                                    <SelectItem value="2">Cat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DataTable 
                        columns={columns} 
                        data={pets} 
                        isLoading={isLoading} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
