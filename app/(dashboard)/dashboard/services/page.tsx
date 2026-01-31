'use client';

import React, { useState } from 'react';
import { useServices, useService } from '@/hooks/use-services';
import { useServiceCategories } from '@/hooks/use-service-categories';
import { useSpecies } from '@/hooks/use-species';
import { useLifeStages } from '@/hooks/use-life-stages';
import { useSubscriptionTiers } from '@/hooks/use-subscription-tiers';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Settings, Clock, Info } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { Service, ServiceCategory, Species, LifeStage, SubscriptionTier, ServiceAvailability } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/forms/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const serviceSchema = z.object({
    service_name: z.string().min(1, 'Service name is required').max(255),
    category_id: z.coerce.number().int().min(1, 'Category is required'),
    description: z.string().max(1000).optional(),
    detailed_description: z.string().max(5000).optional(),
    base_price: z.coerce.number().min(0, 'Price must be 0 or more'),
    duration_minutes: z.coerce.number().int().min(1, 'Duration must be at least 1 minute'),
    is_doorstep: z.boolean().default(true),
    requires_equipment: z.boolean().default(false),
    preparation_instructions: z.string().max(2000).optional(),
    terms_conditions: z.string().max(2000).optional(),
    icon_url: z.string().url('Invalid URL').optional().or(z.literal('')),
    is_active: z.boolean().default(true),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicesPage() {
    const { services, isLoading, createService, updateService, deleteService } = useServices();
    const { categories } = useServiceCategories();
    const { species } = useSpecies();
    const { lifeStages } = useLifeStages();
    const { tiers } = useSubscriptionTiers();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [activeTab, setActiveTab] = useState('basic');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema) as any,
        defaultValues: {
            is_active: true,
            is_doorstep: true,
            requires_equipment: false,
            base_price: 0,
            duration_minutes: 60,
        },
    });

    const isDoorstep = watch('is_doorstep');
    const requiresEquipment = watch('requires_equipment');
    const isActive = watch('is_active');

    const handleAdd = () => {
        setSelectedService(null);
        reset({
            service_name: '',
            category_id: 0,
            description: '',
            detailed_description: '',
            base_price: 0,
            duration_minutes: 60,
            is_doorstep: true,
            requires_equipment: false,
            is_active: true,
            icon_url: '',
        });
        setActiveTab('basic');
        setIsDialogOpen(true);
    };

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        reset({
            service_name: service.service_name,
            category_id: service.category_id,
            description: service.description || '',
            detailed_description: service.detailed_description || '',
            base_price: service.base_price,
            duration_minutes: service.duration_minutes,
            is_doorstep: service.is_doorstep,
            requires_equipment: service.requires_equipment,
            is_active: service.is_active,
            icon_url: service.icon_url || '',
            preparation_instructions: service.preparation_instructions || '',
            terms_conditions: service.terms_conditions || '',
        });
        setActiveTab('basic');
        setIsDialogOpen(true);
    };

    const handleDelete = (service: Service) => {
        setSelectedService(service);
        setIsDeleteDialogOpen(true);
    };

    const onSubmit = (data: ServiceFormData) => {
        if (selectedService) {
            updateService(
                { id: selectedService.service_id, data },
                {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        reset();
                    },
                }
            );
        } else {
            createService(data, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (selectedService) {
            deleteService(selectedService.service_id, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedService(null);
                },
            });
        }
    };

    const columns: ColumnDef<Service>[] = [
        {
            accessorKey: 'service_name',
            header: 'Service',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.icon_url ? (
                        <img src={row.original.icon_url} alt="" className="h-10 w-10 object-contain rounded bg-gray-50 p-1" />
                    ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            <Settings className="h-5 w-5 text-gray-400" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.service_name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.category_name}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'base_price',
            header: 'Base Price',
            cell: ({ row }) => <span className="font-mono">₹{row.original.base_price}</span>,
        },
        {
            accessorKey: 'duration_minutes',
            header: 'Duration',
            cell: ({ row }) => <span>{row.original.duration_minutes} mins</span>,
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.original)}
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="mt-4 text-sm text-gray-600">Loading services Catalog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Catalog</h1>
                    <p className="text-muted-foreground mt-1">Manage all pet services, their eligibility rules and pricing matrix.</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                </Button>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={services}
                searchKey="service_name"
                searchPlaceholder="Search services..."
            />

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>
                            {selectedService ? 'Edit Service' : 'Add New Service'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure service details, eligibility rules, and availability.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 border-b">
                            <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-6">
                                <TabsTrigger 
                                    value="basic" 
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
                                >
                                    Basic Info
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="eligibility" 
                                    disabled={!selectedService}
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
                                >
                                    Eligibility Matrix
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="availability" 
                                    disabled={!selectedService}
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full"
                                >
                                    Availability
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 min-h-0">
                            <TabsContent value="basic" className="mt-0 space-y-6 outline-none">
                                <form id="service-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="service_name">Service Name *</Label>
                                            <Input
                                                id="service_name"
                                                placeholder="e.g., Luxury Dog Grooming"
                                                {...register('service_name')}
                                            />
                                            {errors.service_name && (
                                                <p className="text-xs text-red-600 font-medium">{errors.service_name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">Category *</Label>
                                            <Controller
                                                control={control}
                                                name="category_id"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((cat) => (
                                                                <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                                                                    {cat.category_name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.category_id && (
                                                <p className="text-xs text-red-600 font-medium">{errors.category_id.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="base_price">Base Price (₹) *</Label>
                                            <Input
                                                id="base_price"
                                                type="number"
                                                step="0.01"
                                                {...register('base_price')}
                                            />
                                            {errors.base_price && (
                                                <p className="text-xs text-red-600 font-medium">{errors.base_price.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="duration_minutes">Duration (Minutes) *</Label>
                                            <Input
                                                id="duration_minutes"
                                                type="number"
                                                {...register('duration_minutes')}
                                            />
                                            {errors.duration_minutes && (
                                                <p className="text-xs text-red-600 font-medium">{errors.duration_minutes.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Short Description</Label>
                                        <Textarea
                                            id="description"
                                            rows={2}
                                            placeholder="A brief summary shown on listing pages..."
                                            {...register('description')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="detailed_description">Detailed Description</Label>
                                        <Textarea
                                            id="detailed_description"
                                            rows={4}
                                            placeholder="Detailed information, features, and process..."
                                            {...register('detailed_description')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Doorstep Delivery</Label>
                                                <p className="text-xs text-muted-foreground">Available at customer residence</p>
                                            </div>
                                            <Switch
                                                checked={isDoorstep}
                                                onCheckedChange={(checked) => setValue('is_doorstep', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Requires Equipment</Label>
                                                <p className="text-xs text-muted-foreground">Caregiver needs special tools</p>
                                            </div>
                                            <Switch
                                                checked={requiresEquipment}
                                                onCheckedChange={(checked) => setValue('requires_equipment', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Controller
                                            control={control}
                                            name="icon_url"
                                            render={({ field }) => (
                                                <FileUpload
                                                    label="Service Icon/Photo"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    folder="services"
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label>Active Status</Label>
                                            <p className="text-xs text-muted-foreground">Is this service currently bookable?</p>
                                        </div>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={(checked) => setValue('is_active', checked)}
                                        />
                                    </div>
                                </form>
                            </TabsContent>

                            <TabsContent value="eligibility" className="mt-0 outline-none">
                                <EligibilityMatrix serviceId={selectedService?.service_id!} />
                            </TabsContent>

                            <TabsContent value="availability" className="mt-0 outline-none">
                                <AvailabilityConfig serviceId={selectedService?.service_id!} />
                            </TabsContent>
                        </div>

                        <div className="p-6 border-t bg-muted/20">
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                {activeTab === 'basic' ? (
                                    <Button type="submit" form="service-form">
                                        {selectedService ? 'Update Service' : 'Create Service'}
                                    </Button>
                                ) : activeTab === 'eligibility' ? (
                                    <Button 
                                        onClick={() => {
                                            const saveBtn = document.getElementById('save-eligibility-btn');
                                            if (saveBtn) saveBtn.click();
                                        }}
                                    >
                                        Save Rules
                                    </Button>
                                ) : activeTab === 'availability' ? (
                                    <Button 
                                        onClick={() => {
                                            const saveBtn = document.getElementById('save-availability-btn');
                                            if (saveBtn) saveBtn.click();
                                        }}
                                    >
                                        Save Availability
                                    </Button>
                                ) : (
                                    <Button onClick={() => setIsDialogOpen(false)}>
                                        Done
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Service</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedService?.service_name}"? This action cannot be undone.
                            It will fail if there are any existing bookings for this service.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/**
 * Eligibility Matrix Component
 */
function EligibilityMatrix({ serviceId }: { serviceId: string }) {
    const { species } = useSpecies();
    const { lifeStages } = useLifeStages();
    const { tiers } = useSubscriptionTiers();
    const { eligibility, updateEligibility, isUpdatingEligibility } = useService(serviceId);
    
    const [localRules, setLocalRules] = useState<any[]>([]);

    // Sync local state when eligibility data loads or serviceId changes
    React.useEffect(() => {
        if (eligibility) {
            setLocalRules(eligibility);
        }
    }, [eligibility, serviceId]);

    const isRuleActive = (speciesId: number, lifeStageId: number, tierId: number | null) => {
        return localRules.some(r => 
            r.species_id === speciesId && 
            r.life_stage_id === lifeStageId && 
            r.tier_id === tierId
        );
    };

    const toggleRule = (speciesId: number, lifeStageId: number, tierId: number | null) => {
        const active = isRuleActive(speciesId, lifeStageId, tierId);
        
        if (active) {
            setLocalRules(prev => prev.filter(r => 
                !(r.species_id === speciesId && r.life_stage_id === lifeStageId && r.tier_id === tierId)
            ));
        } else {
            setLocalRules(prev => [...prev, {
                species_id: speciesId,
                life_stage_id: lifeStageId,
                tier_id: tierId,
                is_included: true
            }]);
        }
    };

    const handleSave = () => {
        updateEligibility(localRules as any);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-800">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                    Configure which pets can book this service and how it's priced based on species, 
                    life stage, and subscription tier. Checking a box makes the service available for that pet.
                </p>
            </div>

            <div className="rounded-md border overflow-x-auto relative">
                <table className="w-full text-sm border-collapse min-w-[850px]">
                    <thead className="bg-muted/50 whitespace-nowrap sticky top-0 z-20 shadow-sm">
                        <tr>
                            <th className="p-3 text-left border-b font-medium sticky left-0 bg-white z-30 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Species & Life Stage</th>
                            {tiers.map(tier => (
                                <th key={tier.tier_id} className="p-3 text-center border-b border-r font-medium min-w-[120px]" style={{ borderTop: `4px solid ${tier.color_hex}` }}>
                                    {tier.tier_name}
                                </th>
                            ))}
                            <th className="p-3 text-center border-b font-medium bg-gray-50 min-w-[120px]">Base (Non-Sub)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {species.map(s => (
                            <React.Fragment key={s.species_id}>
                                <tr className="bg-gray-50/50">
                                    <td colSpan={tiers.length + 2} className="p-2 px-3 font-semibold text-[10px] uppercase tracking-wider border-b sticky left-0 z-10 bg-gray-50">
                                        {s.species_name}
                                    </td>
                                </tr>
                                {lifeStages.filter(ls => ls.species_id === s.species_id).map(ls => (
                                    <tr key={ls.life_stage_id} className="hover:bg-muted/30">
                                        <td className="p-3 border-b sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="font-medium">{ls.life_stage_name}</div>
                                            <div className="text-[10px] text-muted-foreground line-clamp-1">{ls.description}</div>
                                        </td>
                                        {tiers.map(tier => {
                                            const active = isRuleActive(s.species_id, ls.life_stage_id, tier.tier_id);
                                            return (
                                                <td key={tier.tier_id} className="p-0 border-b border-r text-center">
                                                    <div 
                                                        className={cn(
                                                            "w-full h-full flex items-center justify-center p-3 cursor-pointer transition-colors",
                                                            active ? "bg-primary/5" : "hover:bg-gray-50"
                                                        )}
                                                        onClick={() => toggleRule(s.species_id, ls.life_stage_id, tier.tier_id)}
                                                    >
                                                        <Checkbox 
                                                            checked={active}
                                                            onCheckedChange={() => toggleRule(s.species_id, ls.life_stage_id, tier.tier_id)}
                                                            className="pointer-events-none"
                                                        />
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="p-0 border-b text-center bg-gray-50/30">
                                            {(() => {
                                                const active = isRuleActive(s.species_id, ls.life_stage_id, null);
                                                return (
                                                    <div 
                                                        className={cn(
                                                            "w-full h-full flex items-center justify-center p-3 cursor-pointer transition-colors",
                                                            active ? "bg-primary/5" : "hover:bg-gray-50"
                                                        )}
                                                        onClick={() => toggleRule(s.species_id, ls.life_stage_id, null)}
                                                    >
                                                        <Checkbox 
                                                            checked={active}
                                                            onCheckedChange={() => toggleRule(s.species_id, ls.life_stage_id, null)}
                                                            className="pointer-events-none"
                                                        />
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Select combinations to allow booking. Click "Save Rules" to persist.</span>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setLocalRules(eligibility || [])}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            <div className="hidden">
                <Button 
                    id="save-eligibility-btn"
                    onClick={handleSave} 
                />
            </div>
        </div>
    );
}

/**
 * Availability Configuration Component
 */
function AvailabilityConfig({ serviceId }: { serviceId: string }) {
    const { availability, updateAvailability, isUpdatingAvailability } = useService(serviceId);
    
    const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    const [localAvailability, setLocalAvailability] = useState<ServiceAvailability[]>([]);

    // Sync local state when availability data loads or serviceId changes
    React.useEffect(() => {
        if (availability && availability.length > 0) {
            setLocalAvailability(availability);
        } else if (!availability || availability.length === 0) {
            // Default 9-6 Mon-Sat
            const defaultAvail = Array.from({ length: 7 }, (_, i) => ({
                availability_id: '', 
                service_id: serviceId,
                day_of_week: i,
                start_time: '09:00',
                end_time: '18:00',
                slot_duration_minutes: 60,
                max_bookings_per_slot: 5,
                buffer_time_minutes: 15,
                is_active: i > 0 && i < 6
            }));
            setLocalAvailability(defaultAvail as any);
        }
    }, [availability, serviceId]);

    const handleUpdate = (dayIndex: number, fields: Partial<ServiceAvailability>) => {
        const newAvail = localAvailability.map((a, i) => 
            i === dayIndex ? { ...a, ...fields } : a
        );
        setLocalAvailability(newAvail);
    };

    const handleSave = () => {
        updateAvailability(localAvailability);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-amber-800">
                <Clock className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                    Configure operational hours and slot capacity for this service. 
                    These settings will be used to generate bookable slots for customers.
                </p>
            </div>

            <div className="grid gap-4">
                {days.map((day, index) => {
                    const dayAvail = localAvailability[index] || {
                        day_of_week: index,
                        is_active: false,
                        start_time: '09:00',
                        end_time: '18:00',
                        max_bookings_per_slot: 5
                    };
                    
                    return (
                        <div 
                            key={day} 
                            className={cn(
                                "flex items-center justify-between p-4 border rounded-lg transition-colors",
                                dayAvail.is_active ? "bg-white border-primary/20 shadow-sm" : "bg-gray-50/50 opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-4 w-1/4">
                                <Checkbox 
                                    id={`day-${index}`} 
                                    checked={dayAvail.is_active} 
                                    onCheckedChange={(checked) => handleUpdate(index, { is_active: !!checked })}
                                />
                                <Label htmlFor={`day-${index}`} className="text-base font-semibold">{day}</Label>
                            </div>
                            
                            <div className="flex items-center gap-6 flex-1">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground letter-spacing-wide">Shift Start</Label>
                                    <Input 
                                        type="time" 
                                        value={dayAvail.start_time.substring(0, 5)} 
                                        disabled={!dayAvail.is_active}
                                        onChange={(e) => handleUpdate(index, { start_time: e.target.value })}
                                        className="h-10 w-32" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Shift End</Label>
                                    <Input 
                                        type="time" 
                                        value={dayAvail.end_time.substring(0, 5)} 
                                        disabled={!dayAvail.is_active}
                                        onChange={(e) => handleUpdate(index, { end_time: e.target.value })}
                                        className="h-10 w-32" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Max/Slot</Label>
                                    <Input 
                                        type="number" 
                                        value={dayAvail.max_bookings_per_slot} 
                                        disabled={!dayAvail.is_active}
                                        onChange={(e) => handleUpdate(index, { max_bookings_per_slot: parseInt(e.target.value) })}
                                        className="h-10 w-20" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Duration (m)</Label>
                                    <Input 
                                        type="number" 
                                        value={dayAvail.slot_duration_minutes || 60} 
                                        className="h-10 w-20" 
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="hidden">
                <Button 
                    id="save-availability-btn"
                    onClick={handleSave} 
                />
            </div>
        </div>
    );
}


