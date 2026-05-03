'use client';

import React, { useState } from 'react';
import { useAddons } from '@/hooks/use-services';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';

export default function AddonsPage() {
    const { addons, isLoading, upsertAddon, isUpserting, deleteAddon } = useAddons();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAddon, setSelectedAddon] = useState<any>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            category: 'HEALTH & SKIN TREATMENTS',
            price: 1000,
            is_active: true
        }
    });

    const isActive = watch('is_active');

    const handleAdd = () => {
        setSelectedAddon(null);
        reset({
            name: '',
            category: 'HEALTH & SKIN TREATMENTS',
            price: 1000,
            is_active: true
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (addon: any) => {
        setSelectedAddon(addon);
        reset({
            name: addon.name,
            category: addon.category,
            price: addon.price,
            is_active: addon.is_active
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (addon: any) => {
        setSelectedAddon(addon);
        setIsDeleteDialogOpen(true);
    };

    const onSubmit = (data: any) => {
        const payload = selectedAddon ? { ...data, addon_id: selectedAddon.addon_id } : data;
        upsertAddon(payload, {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            }
        });
    };

    const confirmDelete = () => {
        if (selectedAddon) {
            deleteAddon(selectedAddon.addon_id, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedAddon(null);
                }
            });
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'name',
            header: 'Add-on Name',
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }) => <span className="font-mono">₹{row.original.price}</span>,
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
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original)}>
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
                    <p className="mt-4 text-sm text-gray-600">Loading add-ons...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add-on Services</h1>
                    <p className="text-muted-foreground mt-1">Manage on-demand add-on services and treatments.</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Add-on
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={addons}
                searchKey="name"
                searchPlaceholder="Search add-ons..."
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedAddon ? 'Edit Add-on' : 'Add New Add-on'}</DialogTitle>
                        <DialogDescription>Configure add-on service details and pricing.</DialogDescription>
                    </DialogHeader>

                    <form id="addon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input id="name" {...register('name', { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select defaultValue={watch('category')} onValueChange={(v) => setValue('category', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HEALTH & SKIN TREATMENTS">HEALTH & SKIN TREATMENTS</SelectItem>
                                        <SelectItem value="COAT & FUR MANAGEMENT">COAT & FUR MANAGEMENT</SelectItem>
                                        <SelectItem value="PREMIUM / COMFORT SERVICES">PREMIUM / COMFORT SERVICES</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input id="price" type="number" {...register('price', { required: true, valueAsNumber: true })} />
                            </div>
                            <div className="flex items-center justify-between space-y-2 pt-8">
                                <Label>Active Status</Label>
                                <Switch checked={isActive} onCheckedChange={(v) => setValue('is_active', v)} />
                            </div>
                        </div>
                    </form>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" form="addon-form" disabled={isUpserting}>
                            {isUpserting ? 'Saving...' : (selectedAddon ? 'Update Add-on' : 'Create Add-on')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Add-on</DialogTitle>
                        <DialogDescription>Are you sure you want to delete "{selectedAddon?.name}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
