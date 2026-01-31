'use client';

import { use, useState } from 'react';
import { 
    useEvent, useEventRegistrations, 
    useUpdateEvent, useCancelEvent, useUpdateRegistrationStatus 
} from '@/hooks/use-community';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Dialog, DialogContent, DialogDescription, 
    DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { EventForm } from '@/components/community/event-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Calendar, MapPin, Users, ArrowLeft, 
    MoreHorizontal, Share2, Edit, XCircle,
    CheckCircle2, Clock, Megaphone, Info,
    User, Mail, Phone, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: event, isLoading } = useEvent(id);
    const { data: registrations, isLoading: isLoadingRegs } = useEventRegistrations(id);
    
    const updateRegStatus = useUpdateRegistrationStatus();
    const cancelEvent = useCancelEvent();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading event details...</div>;
    if (!event) return <div className="p-8 text-center text-red-500">Event not found.</div>;

    const handleCheckIn = async (registrationId: string) => {
        await updateRegStatus.mutateAsync({ id: registrationId, status: 'attended' });
    };

    const handleCancelEvent = async () => {
        if (!cancelReason) return;
        await cancelEvent.mutateAsync({ id, reason: cancelReason });
        setIsCancelDialogOpen(false);
    };

    const registrationList = registrations || [];

    const regColumns: ColumnDef<Record<string, any>>[] = [
        {
            accessorKey: 'user_name',
            header: 'Participant',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.original.user_name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.user_email}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'pet_name',
            header: 'Pet',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.pet_photo ? (
                        <img src={row.original.pet_photo} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                            P
                        </div>
                    )}
                    <span className="text-sm">{row.original.pet_name}</span>
                </div>
            )
        },
        {
            accessorKey: 'registered_at',
            header: 'Registration Date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(row.original.registered_at), 'MMM dd, yyyy')}
                </span>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<string, string> = {
                    registered: 'bg-blue-50 text-blue-600 border-blue-100',
                    attended: 'bg-green-50 text-green-600 border-green-100',
                    cancelled: 'bg-red-50 text-red-600 border-red-100',
                    noshow: 'bg-gray-50 text-gray-600 border-gray-100'
                };
                return (
                    <Badge variant="outline" className={`capitalize font-medium ${variants[status]}`}>
                        {status}
                    </Badge>
                );
            }
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Check-in</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    {row.original.status === 'registered' && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs gap-1.5"
                            onClick={() => handleCheckIn(row.original.registration_id)}
                            disabled={updateRegStatus.isPending}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Check-in
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const statusColors: Record<string, string> = {
        upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
        ongoing: 'bg-orange-100 text-orange-700 border-orange-200'
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/community/events">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
                            <Badge variant="outline" className={`capitalize ${statusColors[event.status] || ''}`}>
                                {event.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {event.event_type} • Organized by {event.organizer_name || 'Tails & Tales'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" disabled>
                        <Share2 className="h-4 w-4" />
                        Public Link
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setIsEditDialogOpen(true)}
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                    {event.status !== 'cancelled' && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"
                            onClick={() => setIsCancelDialogOpen(true)}
                        >
                            <XCircle className="h-4 w-4" />
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogDescription>Update the event details below.</DialogDescription>
                    </DialogHeader>
                    <EventForm 
                        initialData={event}
                        onSuccess={() => setIsEditDialogOpen(false)} 
                        onCancel={() => setIsEditDialogOpen(false)} 
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Event</DialogTitle>
                        <DialogDescription>Are you sure you want to cancel this event? This action cannot be undone and all participants will be notified.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="reason">Cancellation Reason</Label>
                        <Input 
                            id="reason" 
                            placeholder="e.g. Inclement weather conditions" 
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>No, Keep Event</Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleCancelEvent}
                            disabled={!cancelReason || cancelEvent.isPending}
                        >
                            Yes, Cancel Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="participants">Participants ({event.current_participants})</TabsTrigger>
                            <TabsTrigger value="feedback">Feedback</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="mt-6 space-y-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Event Details</CardTitle>
                                        <Badge variant="secondary" className="bg-primary/5 text-primary">
                                            {event.is_free ? 'Free Event' : `₹${event.price}`}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold">Date & Time</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(event.event_date), 'EEEE, MMMM dd, yyyy')}
                                                </p>
                                                <p className="text-sm text-muted-foreground font-medium">
                                                    {event.event_time.slice(0, 5)} - {event.end_time?.slice(0, 5) || 'TBD'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                                <MapPin className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold">Location</p>
                                                <p className="text-sm text-muted-foreground">{event.location_name}</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{event.location_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">About the Event</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {event.detailed_description || event.description}
                                        </p>
                                    </div>

                                    {(event.requirements || event.what_to_bring) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                            {event.requirements && (
                                                <div className="space-y-1.5 text-sm">
                                                    <p className="font-semibold flex items-center gap-2">
                                                        <Info className="h-4 w-4 text-primary" />
                                                        Requirements
                                                    </p>
                                                    <p className="text-muted-foreground">{event.requirements}</p>
                                                </div>
                                            )}
                                            {event.what_to_bring && (
                                                <div className="space-y-1.5 text-sm">
                                                    <p className="font-semibold flex items-center gap-2">
                                                        <Megaphone className="h-4 w-4 text-primary" />
                                                        What to bring
                                                    </p>
                                                    <p className="text-muted-foreground">{event.what_to_bring}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="participants" className="mt-6">
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg">Registration List</CardTitle>
                                    <CardDescription>All participants registered for this session.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <DataTable 
                                        columns={regColumns} 
                                        data={registrationList} 
                                        isLoading={isLoadingRegs} 
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="feedback" className="mt-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg text-center">Event Feedback</CardTitle>
                                    <CardDescription className="text-center">Summarized attendee ratings and suggestions.</CardDescription>
                                </CardHeader>
                                <CardContent className="py-12 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Badge key={star} variant="ghost" className="h-8 w-8 p-0 rounded-full bg-gray-50 text-gray-300">
                                                ★
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">No feedback submitted yet for this event.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    {/* Capacity Overview */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Attendance Forecast</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Confirmed Slots</span>
                                    <span>{event.current_participants} / {event.max_participants}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-500" 
                                        style={{ width: `${(event.current_participants / event.max_participants) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border bg-muted/20 text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Waitlist</p>
                                    <p className="text-xl font-bold mt-1">{event.waitlist_count || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg border bg-muted/20 text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avail. Spots</p>
                                    <p className="text-xl font-bold mt-1">{event.max_participants - event.current_participants}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organizer/Contact */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Lead Organizer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{event.organizer_name || 'In-House Event'}</p>
                                    <p className="text-xs text-muted-foreground">Lead Coordinator</p>
                                </div>
                            </div>
                            <div className="pt-2 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground group">
                                    <Mail className="h-4 w-4" />
                                    <span>{event.organizer_contact || 'support@tailsandtales.com'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Pet Species */}
                    {event.species_id && (
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Audience</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary">
                                            {event.species_name}
                                        </Badge>
                                        <span className="text-sm font-medium">Only</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
