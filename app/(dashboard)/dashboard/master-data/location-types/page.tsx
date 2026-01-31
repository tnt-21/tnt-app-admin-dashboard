'use client';

import { useState } from 'react';
import { useLocationTypes } from '@/hooks/use-location-types';
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
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { LocationType } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const typeSchema = z.object({
  type_code: z.string().min(1, 'Type code is required').max(20),
  type_name: z.string().min(1, 'Type name is required').max(50),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
});

type TypeFormData = z.infer<typeof typeSchema>;

export default function LocationTypesPage() {
  const { types, isLoading, createType, updateType, deleteType } = useLocationTypes();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LocationType | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema) as any,
    defaultValues: {
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  const handleAdd = () => {
    setSelectedType(null);
    reset({
      type_code: '',
      type_name: '',
      description: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (type: LocationType) => {
    setSelectedType(type);
    reset({
      type_code: type.type_code,
      type_name: type.type_name,
      description: type.description || '',
      is_active: type.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (type: LocationType) => {
    setSelectedType(type);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: TypeFormData) => {
    if (selectedType) {
      updateType(
        { id: selectedType.location_type_id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createType(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = () => {
    if (selectedType) {
      deleteType(selectedType.location_type_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedType(null);
        },
      });
    }
  };

  const columns: ColumnDef<LocationType>[] = [
    {
      accessorKey: 'type_name',
      header: 'Location Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1 leading-none rounded bg-gray-100">
            <MapPin className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.type_name}</span>
            <span className="text-xs text-muted-foreground">{row.original.type_code}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 line-clamp-1 max-w-md">
          {row.original.description || '-'}
        </span>
      ),
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
          <p className="mt-4 text-sm text-gray-600">Loading location types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Location Types</h1>
          <p className="text-gray-600 mt-1">Manage where services can be delivered</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={types}
        searchKey="type_name"
        searchPlaceholder="Search types..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedType ? 'Edit Location Type' : 'Add New Location Type'}
            </DialogTitle>
            <DialogDescription>
              Define a delivery location for services (e.g., Doorstep, Clinic, Park).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type_code">Code *</Label>
                <Input
                  id="type_code"
                  placeholder="e.g., DOORSTEP"
                  {...register('type_code')}
                />
                {errors.type_code && (
                  <p className="text-sm text-red-600">{errors.type_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type_name">Name *</Label>
                <Input
                  id="type_name"
                  placeholder="e.g., Doorstep"
                  {...register('type_name')}
                />
                {errors.type_name && (
                  <p className="text-sm text-red-600">{errors.type_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this location type..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedType ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedType?.type_name}" type? This action
              cannot be undone and will fail if any services or bookings are associated with it.
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
