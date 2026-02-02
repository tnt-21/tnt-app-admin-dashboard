'use client';

import { 
    Dialog, DialogContent, DialogDescription, 
    DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAvailableCaregivers, useBookingMutations } from '@/hooks/use-bookings';
import { Loader2, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface AvailableCaregiversDialogProps {
    bookingId: string;
    onAssigned?: () => void;
}

export function AvailableCaregiversDialog({ bookingId, onAssigned }: AvailableCaregiversDialogProps) {
    const [open, setOpen] = useState(false);
    const { caregivers, isLoading } = useAvailableCaregivers(bookingId);
    const { assignCaregiver } = useBookingMutations();

    const handleAssign = async (caregiverId: string) => {
        try {
            await assignCaregiver.mutateAsync({ bookingId, caregiverId });
            toast.success('Caregiver assigned successfully');
            setOpen(false);
            if (onAssigned) onAssigned();
        } catch (error) {
            toast.error('Failed to assign caregiver');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    See More Available Caregivers
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Available Caregivers</DialogTitle>
                    <DialogDescription>
                        Showing caregivers available for this service area and specialization.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : caregivers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground italic">
                            No other available caregivers found for this area.
                        </div>
                    ) : (
                        caregivers.map((caregiver: any) => (
                            <div 
                                key={caregiver.caregiver_id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{caregiver.full_name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            {caregiver.phone}
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleAssign(caregiver.caregiver_id)}
                                    disabled={assignCaregiver.isPending}
                                >
                                    Assign
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
