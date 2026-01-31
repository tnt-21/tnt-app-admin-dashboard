'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePromoCode, useUpdatePromoCode } from '@/hooks/use-promo';
import { format } from 'date-fns';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const promoSchema = z.object({
    promo_code: z.string().min(3, 'Code must be at least 3 characters').max(15, 'Code too long'),
    promo_name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional().nullable(),
    discount_type: z.enum(['percentage', 'fixed_amount']),
    discount_value: z.number().min(1, 'Discount must be at least 1'),
    max_discount_amount: z.number().nullable(),
    min_purchase_amount: z.number().nullable(),
    applicable_to: z.enum(['all', 'subscription', 'service']),
    max_uses_total: z.number().nullable(),
    max_uses_per_user: z.number().min(1),
    valid_from: z.string(),
    valid_until: z.string(),
    is_active: z.boolean(),
});

type PromoFormValues = z.infer<typeof promoSchema>;

interface PromoFormProps {
    initialData?: any;
    onSuccess: () => void;
}

export function PromoForm({ initialData, onSuccess }: PromoFormProps) {
    const createPromo = useCreatePromoCode();
    const updatePromo = useUpdatePromoCode();
    
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PromoFormValues>({
        resolver: zodResolver(promoSchema),
        defaultValues: initialData ? {
            ...initialData,
            description: initialData.description || '',
            valid_from: format(new Date(initialData.valid_from), 'yyyy-MM-dd'),
            valid_until: format(new Date(initialData.valid_until), 'yyyy-MM-dd'),
            discount_value: Number(initialData.discount_value),
            max_discount_amount: initialData.max_discount_amount ? Number(initialData.max_discount_amount) : null,
            min_purchase_amount: initialData.min_purchase_amount ? Number(initialData.min_purchase_amount) : null,
            max_uses_total: initialData.max_uses_total ? Number(initialData.max_uses_total) : null,
        } : {
            promo_code: '',
            promo_name: '',
            description: '',
            discount_type: 'percentage',
            discount_value: 0,
            max_discount_amount: null,
            min_purchase_amount: null,
            applicable_to: 'all',
            max_uses_total: null,
            max_uses_per_user: 1,
            valid_from: format(new Date(), 'yyyy-MM-dd'),
            valid_until: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
            is_active: true,
        },
    });

    const onSubmit = (values: PromoFormValues) => {
        const payload = {
            ...values,
            promo_code: values.promo_code.toUpperCase(),
        };

        if (initialData) {
            updatePromo.mutate({ id: initialData.promo_id, data: payload }, {
                onSuccess: () => onSuccess()
            });
        } else {
            createPromo.mutate(payload, {
                onSuccess: () => onSuccess()
            });
        }
    };

    const isLoading = createPromo.isPending || updatePromo.isPending;
    const discountType = watch('discount_type');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="promo_code">Promo Code</Label>
                    <Input 
                        id="promo_code" 
                        {...register('promo_code')} 
                        placeholder="SUMMER50" 
                        className="uppercase font-mono" 
                    />
                    {errors.promo_code && <p className="text-xs text-red-500">{errors.promo_code.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="promo_name">Campaign Name</Label>
                    <Input id="promo_name" {...register('promo_name')} placeholder="Summer Sale 2024" />
                    {errors.promo_name && <p className="text-xs text-red-500">{errors.promo_name.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="Describe the campaign..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select 
                        onValueChange={(v: any) => setValue('discount_type', v)} 
                        defaultValue={watch('discount_type')}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="discount_value">Value {discountType === 'percentage' ? '(%)' : '(₹)'}</Label>
                    <Input 
                        id="discount_value" 
                        type="number" 
                        {...register('discount_value', { valueAsNumber: true })} 
                    />
                    {errors.discount_value && <p className="text-xs text-red-500">{errors.discount_value.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="max_discount_amount">Max Discount (₹)</Label>
                    <Input 
                        id="max_discount_amount" 
                        type="number" 
                        {...register('max_discount_amount', { valueAsNumber: true })} 
                        placeholder="No limit"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="valid_from">Starts From</Label>
                    <Input id="valid_from" type="date" {...register('valid_from')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="valid_until">Expires On</Label>
                    <Input id="valid_until" type="date" {...register('valid_until')} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="max_uses_total">Total Usage Limit</Label>
                    <Input 
                        id="max_uses_total" 
                        type="number" 
                        {...register('max_uses_total', { valueAsNumber: true })} 
                        placeholder="Unlimited"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="max_uses_per_user">Limit Per User</Label>
                    <Input 
                        id="max_uses_per_user" 
                        type="number" 
                        {...register('max_uses_per_user', { valueAsNumber: true })} 
                    />
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-dashed">
                <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-gray-900">Active Status</Label>
                    <p className="text-[11px] text-gray-500">Enable or disable this promo code immediately.</p>
                </div>
                <Switch 
                    checked={watch('is_active')} 
                    onCheckedChange={(checked) => setValue('is_active', checked)} 
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="submit" disabled={isLoading} className="min-w-[140px] gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {initialData ? 'Update Campaign' : 'Create Campaign'}
                </Button>
            </div>
        </form>
    );
}
