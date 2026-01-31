'use client';

import { useState } from 'react';
import { useSpecies } from '@/hooks/use-species';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { Species } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/forms/file-upload';

const speciesSchema = z.object({
  species_code: z.string().min(1, 'Species code is required').max(50),
  species_name: z.string().min(1, 'Species name is required').max(100),
  icon_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

type SpeciesFormData = z.infer<typeof speciesSchema>;

export default function SpeciesPage() {
  const { species, isLoading, createSpecies, updateSpecies, deleteSpecies, toggleActive } =
    useSpecies();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SpeciesFormData>({
    resolver: zodResolver(speciesSchema) as any,
    defaultValues: {
      is_active: true,
      icon_url: '',
    },
  });

  const isActive = watch('is_active');

  const handleAdd = () => {
    setSelectedSpecies(null);
    reset({
      species_code: '',
      species_name: '',
      icon_url: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (species: Species) => {
    setSelectedSpecies(species);
    reset({
      species_code: species.species_code,
      species_name: species.species_name,
      icon_url: species.icon_url || '',
      is_active: species.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (species: Species) => {
    setSelectedSpecies(species);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: SpeciesFormData) => {
    if (selectedSpecies) {
      updateSpecies(
        { id: selectedSpecies.species_id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createSpecies(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = () => {
    if (selectedSpecies) {
      deleteSpecies(selectedSpecies.species_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedSpecies(null);
        },
      });
    }
  };

  const columns: ColumnDef<Species>[] = [
    {
      accessorKey: 'species_code',
      header: 'Code',
    },
    {
      accessorKey: 'species_name',
      header: 'Name',
    },
    {
      accessorKey: 'icon_url',
      header: 'Icon',
      cell: ({ row }) => {
        const iconUrl = row.original.icon_url;
        return iconUrl ? (
          <img src={iconUrl} alt={row.original.species_name} className="h-8 w-8 rounded" />
        ) : (
          <span className="text-gray-400 text-sm">No icon</span>
        );
      },
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
          <p className="mt-4 text-sm text-gray-600">Loading species...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Species Management</h1>
          <p className="text-gray-600 mt-1">Manage pet species in the system</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Species
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={species}
        searchKey="species_name"
        searchPlaceholder="Search species..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSpecies ? 'Edit Species' : 'Add New Species'}
            </DialogTitle>
            <DialogDescription>
              {selectedSpecies
                ? 'Update the species information below.'
                : 'Fill in the details to create a new species.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="species_code">Species Code *</Label>
              <Input
                id="species_code"
                placeholder="e.g., DOG, CAT"
                {...register('species_code')}
              />
              {errors.species_code && (
                <p className="text-sm text-red-600">{errors.species_code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="species_name">Species Name *</Label>
              <Input
                id="species_name"
                placeholder="e.g., Dog, Cat"
                {...register('species_name')}
              />
              {errors.species_name && (
                <p className="text-sm text-red-600">{errors.species_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Controller
                control={control}
                name="icon_url"
                render={({ field }) => (
                  <FileUpload
                    label="Species Icon"
                    value={field.value}
                    onChange={field.onChange}
                    folder="species-icons"
                  />
                )}
              />
              {errors.icon_url && (
                <p className="text-sm text-red-600">{errors.icon_url.message}</p>
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
                {selectedSpecies ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Species</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSpecies?.species_name}"? This action
              cannot be undone.
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
