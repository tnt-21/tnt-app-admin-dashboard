'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Calendar as CalendarIcon, Clock, MapPin, Tag } from 'lucide-react';
import { useCreateEvent, useUpdateEvent } from '@/hooks/use-community';
import { format } from 'date-fns';

interface EventFormProps {
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function EventForm({ initialData, onSuccess, onCancel }: EventFormProps) {
    const isEditing = !!initialData;
    const createEvent = useCreateEvent();
    const updateEvent = useUpdateEvent();

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        detailed_description: initialData?.detailed_description || '',
        event_type: initialData?.event_type || 'socialization',
        event_date: initialData?.event_date || '',
        event_time: initialData?.event_time || '',
        location_name: initialData?.location_name || '',
        location_address: initialData?.location_address || '',
        max_participants: initialData?.max_participants || 20,
        price: initialData?.price || 0,
        is_free: initialData?.is_free ?? true,
        waitlist_enabled: initialData?.waitlist_enabled ?? false,
        organizer_name: initialData?.organizer_name || 'Tails & Tales',
        organizer_contact: initialData?.organizer_contact || 'support@tailsandtales.com',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            price: formData.is_free ? 0 : parseFloat(formData.price.toString()),
            max_participants: parseInt(formData.max_participants.toString()),
        };

        try {
            if (isEditing) {
                await updateEvent.mutateAsync({ id: initialData.event_id, data: payload });
            } else {
                await createEvent.mutateAsync(payload);
            }
            onSuccess();
        } catch (error) {
            // Error is handled by hook toasts
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input 
                            id="title" 
                            placeholder="e.g. Sunday Puppy Social Session" 
                            required 
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select 
                        value={formData.event_type}
                        onValueChange={(val) => setFormData({ ...formData, event_type: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="socialization">Socialization</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="meetup">Meetup</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="organizer">Lead Organizer</Label>
                    <Input 
                        id="organizer" 
                        value={formData.organizer_name}
                        onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Event Date</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="date" 
                            type="date" 
                            className="pl-9" 
                            required 
                            value={formData.event_date ? format(new Date(formData.event_date), 'yyyy-MM-dd') : ''}
                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="time">Start Time</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="time" 
                            type="time" 
                            className="pl-9" 
                            required 
                            value={formData.event_time}
                            onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location Name</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="location" 
                            placeholder="e.g. T&T Hub, Sector 12" 
                            className="pl-9" 
                            required 
                            value={formData.location_name}
                            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea 
                        id="description" 
                        placeholder="Briefly describe what happens at this event..." 
                        rows={2} 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <Separator className="md:col-span-2 my-2" />

                <div className="space-y-2">
                    <Label htmlFor="max_p">Max Participants</Label>
                    <Input 
                        id="max_p" 
                        type="number" 
                        min="1" 
                        value={formData.max_participants}
                        onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price">Price (INR)</Label>
                    <div className="flex items-center gap-3 h-10 px-1">
                        <input 
                            type="checkbox" 
                            id="is_free" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={formData.is_free}
                            onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                        />
                        <Label htmlFor="is_free" className="text-sm font-normal">Free Event</Label>
                        {!formData.is_free && (
                            <Input 
                                id="price" 
                                type="number" 
                                className="flex-1" 
                                placeholder="Amount" 
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" type="button" onClick={onCancel} disabled={createEvent.isPending || updateEvent.isPending}>
                    Cancel
                </Button>
                <Button type="submit" className="px-8" disabled={createEvent.isPending || updateEvent.isPending}>
                    {isEditing ? 'Save Changes' : 'Create Event'}
                </Button>
            </div>
        </form>
    );
}
