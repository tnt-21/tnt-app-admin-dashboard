'use client';

import { useState } from 'react';
import { useServiceCategories } from '@/hooks/use-service-categories';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { ServiceCategory } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/forms/file-upload';

const categorySchema = z.object({
  category_code: z.string().min(1, 'Category code is required').max(50),
  category_name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
  icon_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  display_order: z.coerce.number().int().min(0, 'Display order must be 0 or more'),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function ServiceCategoriesPage() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } =
    useServiceCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      is_active: true,
      display_order: 0,
      icon_url: '',
    },
  });

  const isActive = watch('is_active');

  const handleAdd = () => {
    setSelectedCategory(null);
    reset({
      category_code: '',
      category_name: '',
      description: '',
      icon_url: '',
      display_order: categories.length + 1,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: ServiceCategory) => {
    setSelectedCategory(category);
    reset({
      category_code: category.category_code,
      category_name: category.category_name,
      description: category.description || '',
      icon_url: category.icon_url || '',
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: CategoryFormData) => {
    if (selectedCategory) {
      updateCategory(
        { id: selectedCategory.category_id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createCategory(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.category_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedCategory(null);
        },
      });
    }
  };

  const columns: ColumnDef<ServiceCategory>[] = [
    {
      accessorKey: 'category_name',
      header: 'Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.icon_url ? (
            <img src={row.original.icon_url} alt="" className="h-8 w-8 object-contain rounded bg-gray-50" />
          ) : (
            <div className="h-8 w-8 bg-gray-100 rounded" />
          )}
          <div className="flex flex-col">
            <span className="font-medium">{row.original.category_name}</span>
            <span className="text-xs text-muted-foreground">{row.original.category_code}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'display_order',
      header: 'Order',
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
          <p className="text-gray-600 mt-1">Manage categories for your services (e.g., Grooming, Health)</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={categories}
        searchKey="category_name"
        searchPlaceholder="Search categories..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              Define a high-level category for services.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_code">Code *</Label>
                <Input
                  id="category_code"
                  placeholder="e.g., GROOMING"
                  {...register('category_code')}
                />
                {errors.category_code && (
                  <p className="text-sm text-red-600">{errors.category_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_name">Name *</Label>
                <Input
                  id="category_name"
                  placeholder="e.g., Grooming"
                  {...register('category_name')}
                />
                {errors.category_name && (
                  <p className="text-sm text-red-600">{errors.category_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                {...register('display_order')}
              />
              {errors.display_order && (
                <p className="text-sm text-red-600">{errors.display_order.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Controller
                control={control}
                name="icon_url"
                render={({ field }) => (
                  <FileUpload
                    label="Category Icon"
                    value={field.value}
                    onChange={field.onChange}
                    folder="service-categories"
                  />
                )}
              />
              {errors.icon_url && (
                <p className="text-sm text-red-600">{errors.icon_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this category..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Status</Label>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.category_name}"? This action
              cannot be undone and will fail if any services are currently assigned to this category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
