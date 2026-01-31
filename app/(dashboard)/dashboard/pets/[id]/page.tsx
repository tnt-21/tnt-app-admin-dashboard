'use client';

import { use } from 'react';
import { usePetDetails } from '@/hooks/use-pets';
import { useBookings } from '@/hooks/use-bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    PawPrint, Calendar, User, Heart, 
    ArrowLeft, Clock, MapPin, Activity, Phone
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { pet, isLoading: petLoading } = usePetDetails(id);
    const { bookings, isLoading: bookingsLoading } = useBookings({ pet_id: id });

    if (petLoading) return <div className="p-8 text-center text-muted-foreground">Loading pet details...</div>;
    if (!pet) return <div className="p-8 text-center text-red-500">Pet not found.</div>;

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
                <Link href="/dashboard/pets/all">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{pet.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{pet.species_name}</Badge>
                        <Badge variant="outline">{pet.breed || 'Unknown Breed'}</Badge>
                        <span className="text-sm text-muted-foreground">ID: {id.slice(0, 8)}...</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <div className="aspect-square bg-muted relative">
                            {pet.photo_url ? (
                                <img 
                                    src={pet.photo_url} 
                                    alt={pet.name} 
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <PawPrint className="h-20 w-20 text-muted-foreground/20" />
                                </div>
                            )}
                        </div>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Heart className="h-4 w-4" /> Gender
                                </span>
                                <span className="text-sm capitalize">{pet.gender || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Age
                                </span>
                                <span className="text-sm">{pet.life_stage_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Weight
                                </span>
                                <span className="text-sm">{pet.weight_kg ? `${pet.weight_kg} kg` : 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Owner Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Link 
                                    href={`/dashboard/users/${pet.owner_id}`}
                                    className="text-sm font-medium hover:underline text-primary"
                                >
                                    {pet.owner_name}
                                </Link>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{pet.owner_phone}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="border-none shadow-sm bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Health Records</p>
                                        <p className="text-2xl font-bold">{pet.health_records_count || 0}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-orange-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                                        <p className="text-2xl font-bold">{bookings?.length || 0}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Service History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DataTable 
                                columns={bookingColumns} 
                                data={bookings || []} 
                                isLoading={bookingsLoading} 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
