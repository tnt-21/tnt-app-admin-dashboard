'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
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
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { Product } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/forms/file-upload';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(255),
    company_name: z.string().max(255).optional(),
    description: z.string().max(1000).optional(),
    price: z.coerce.number().min(0, 'Price must be 0 or more'),
    photo_url: z.string().optional().or(z.literal('')),
    is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
    const { products, isLoading, createProduct, isCreating, updateProduct, isUpdating, deleteProduct } = useProducts();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            is_active: true,
            price: 0,
        },
    });

    const isActive = watch('is_active');

    const handleAdd = () => {
        setSelectedProduct(null);
        reset({
            name: '',
            company_name: '',
            description: '',
            price: 0,
            is_active: true,
            photo_url: '',
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        reset({
            name: product.name,
            company_name: product.company_name || '',
            description: product.description || '',
            price: product.price,
            is_active: product.is_active,
            photo_url: product.photo_url || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    const onSubmit = (data: ProductFormData) => {
        if (selectedProduct) {
            updateProduct(
                { id: selectedProduct.product_id, data },
                {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        reset();
                    },
                }
            );
        } else {
            createProduct(data, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (selectedProduct) {
            deleteProduct(selectedProduct.product_id, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedProduct(null);
                },
            });
        }
    };

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: 'Product',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.photo_url ? (
                        <img src={row.original.photo_url} alt="" className="h-10 w-10 object-cover rounded bg-gray-50" />
                    ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.company_name || 'Generic'}</span>
                    </div>
                </div>
            ),
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
                    <p className="mt-4 text-sm text-gray-600">Loading products catalog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
                    <p className="text-muted-foreground mt-1">Manage third-party products and their pricing.</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={products}
                searchKey="name"
                searchPlaceholder="Search products..."
            />

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <DialogDescription>
                            Enter product details and upload a photo.
                        </DialogDescription>
                    </DialogHeader>

                    <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Premium Dog Treats"
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-600 font-medium">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    placeholder="e.g., Pedigree"
                                    {...register('company_name')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register('price')}
                                />
                                {errors.price && (
                                    <p className="text-xs text-red-600 font-medium">{errors.price.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between space-y-2 pt-8">
                                <Label>Active Status</Label>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={(checked) => setValue('is_active', checked)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                placeholder="Describe the product..."
                                {...register('description')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Controller
                                control={control}
                                name="photo_url"
                                render={({ field }) => (
                                    <FileUpload
                                        label="Product Photo"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onUploadingChange={setIsUploadingPhoto}
                                        folder="products"
                                    />
                                )}
                            />
                        </div>
                    </form>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" form="product-form" disabled={isUploadingPhoto || isCreating || isUpdating}>
                            {(isCreating || isUpdating) ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    Saving...
                                </>
                            ) : isUploadingPhoto ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                selectedProduct ? 'Update Product' : 'Create Product'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
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
