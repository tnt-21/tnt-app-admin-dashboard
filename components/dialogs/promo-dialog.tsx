'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { PromoForm } from '../forms/promo-form';
import { useState } from 'react';

interface PromoDialogProps {
    children: React.ReactNode;
    initialData?: any;
    title?: string;
}

export function PromoDialog({ children, initialData, title }: PromoDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{title || (initialData ? 'Edit Promo Code' : 'Create New Promo Code')}</DialogTitle>
                    <DialogDescription>
                        {initialData 
                            ? 'Update the details for this promotional campaign.' 
                            : 'Set up a new promotional code with discounts and usage limits.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <PromoForm 
                        initialData={initialData} 
                        onSuccess={() => setOpen(false)} 
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
