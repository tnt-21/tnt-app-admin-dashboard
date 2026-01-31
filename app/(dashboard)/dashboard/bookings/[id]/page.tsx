'use client';

import { use, useState } from 'react';
import { useBookingDetails, useBookingMutations } from '@/hooks/use-bookings';
import { useBookingStatuses } from '@/hooks/use-booking-statuses';
import { useCaregivers } from '@/hooks/use-caregivers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar, Clock, User, PawPrint, 
    ArrowLeft, History, CheckCircle2, XCircle,
    UserPlus, MapPin, Info, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { booking, isLoading: bookingLoading, refetch } = useBookingDetails(id);
    const { statuses } = useBookingStatuses();
    const { caregivers } = useCaregivers({ limit: 100, status: 'active' });
    const { updateStatus, assignCaregiver } = useBookingMutations();

    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedCaregiver, setSelectedCaregiver] = useState<string>('');

    if (bookingLoading) return <div className="p-8 text-center text-muted-foreground">Loading booking details...</div>;
    if (!booking) return <div className="p-8 text-center text-red-500">Booking not found.</div>;

    const handleStatusUpdate = async () => {
        if (!selectedStatus) return;
        const status = statuses?.find((s: Record<string, any>) => s.status_code === selectedStatus || s.status_id.toString() === selectedStatus);
        if (!status) return;

        try {
            await updateStatus.mutateAsync({ id, statusId: status.status_id });
            toast.success('Status updated successfully');
            setSelectedStatus('');
            refetch();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleAssignCaregiver = async () => {
        if (!selectedCaregiver) return;
        try {
            await assignCaregiver.mutateAsync({ bookingId: id, caregiverId: selectedCaregiver });
            toast.success('Caregiver assigned successfully');
            setSelectedCaregiver('');
            refetch();
        } catch (error) {
            toast.error('Failed to assign caregiver');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/bookings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">Booking #{booking.booking_number}</h1>
                        <Badge 
                            style={{ 
                                backgroundColor: (booking.status_color || '#cccccc') + '20', 
                                color: booking.status_color || '#666666',
                                borderColor: (booking.status_color || '#cccccc') + '40'
                            }}
                            variant="outline"
                        >
                            {booking.status_name}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Scheduled for {format(new Date(booking.booking_date), 'PPPP')} at {booking.booking_time}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Details */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                Service Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Service</p>
                                    <p className="font-semibold text-primary">{booking.service_name}</p>
                                    <p className="text-sm text-muted-foreground">{booking.category_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Location</p>
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <span>
                                            {booking.address_line1}, {booking.address_line2 && `${booking.address_line2}, `}
                                            {booking.city}, {booking.state} - {booking.pincode}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="mt-1">{booking.location_type_name}</Badge>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Customer</p>
                                    <Link 
                                        href={`/dashboard/users/${booking.user_id}`}
                                        className="flex items-center gap-2 hover:underline group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm group-hover:text-primary">{booking.owner_name}</p>
                                            <p className="text-xs text-muted-foreground">{booking.owner_phone}</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Pet</p>
                                    <Link 
                                        href={`/dashboard/pets/${booking.pet_id}`}
                                        className="flex items-center gap-2 hover:underline group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <PawPrint className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm group-hover:text-orange-600">{booking.pet_name}</p>
                                            <p className="text-xs text-muted-foreground">ID: {booking.pet_id.slice(0, 8)}</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status History */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Status Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {booking.status_history?.map((event: Record<string, any>, idx: number) => (
                                    <div key={event.history_id} className="relative flex gap-4">
                                        {idx !== booking.status_history.length - 1 && (
                                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted" />
                                        )}
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                            idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        }`}>
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-sm">
                                                    Status: {event.new_status_name || 'Update'}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(event.created_at), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                By {event.changed_by_name} ({event.changed_by_role})
                                            </p>
                                            {event.reason && (
                                                <p className="text-xs bg-muted/50 p-2 rounded mt-2 border-l-2 border-muted italic">
                                                    "{event.reason}"
                                                </p>
                                            )}
                                            {event.notes && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {event.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!booking.status_history || booking.status_history.length === 0) && (
                                    <p className="text-center py-4 text-muted-foreground text-sm italic">No history available.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Assignment Info */}
                    <Card className="border-none shadow-sm bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-primary" />
                                Caregiver Assignment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {booking.caregiver_id ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-primary/10">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{booking.caregiver_name}</p>
                                            <p className="text-xs text-muted-foreground">{booking.caregiver_phone}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Reassign Caregiver</p>
                                        <div className="flex gap-2">
                                            <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select caregiver" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {caregivers?.map((c: Record<string, any>) => (
                                                        <SelectItem key={c.caregiver_id} value={c.caregiver_id}>
                                                            {c.full_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button 
                                                size="sm" 
                                                onClick={handleAssignCaregiver}
                                                disabled={!selectedCaregiver || assignCaregiver.isPending}
                                            >
                                                Assign
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                        <AlertCircle className="h-4 w-4" />
                                        <p className="text-xs font-medium">No caregiver assigned yet</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select for assignment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {caregivers?.map((c: Record<string, any>) => (
                                                    <SelectItem key={c.caregiver_id} value={c.caregiver_id}>
                                                        {c.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            className="w-full"
                                            onClick={handleAssignCaregiver}
                                            disabled={!selectedCaregiver || assignCaregiver.isPending}
                                        >
                                            Assign Caregiver
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Update Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Transition to..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses?.filter((s: Record<string, any>) => s.status_id !== booking.status_id).map((status: Record<string, any>) => (
                                        <SelectItem key={status.status_id} value={status.status_code}>
                                            {status.status_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                className="w-full h-10 gap-2" 
                                variant="outline"
                                onClick={handleStatusUpdate}
                                disabled={!selectedStatus || updateStatus.isPending}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Update Status
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
