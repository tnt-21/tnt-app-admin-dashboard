'use client';

import { useState } from 'react';
import { useLifeStages } from '@/hooks/use-life-stages';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { LifeStage } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const lifeStageSchema = z.object({
  species_id: z.string().min(1, 'Species is required'),
  life_stage_code: z.string().min(1, 'Life stage code is required').max(30),
  life_stage_name: z.string().min(1, 'Life stage name is required').max(100),
  min_age_months: z.coerce.number().min(0, 'Min age must be 0 or more').optional(),
  max_age_months: z.coerce.number().min(0, 'Max age must be 0 or more').optional().nullable(),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
});

type LifeStageFormData = z.infer<typeof lifeStageSchema>;

export default function LifeStagesPage() {
  const { species } = useSpecies();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('all');
  
  const { 
    lifeStages, 
    isLoading, 
    createLifeStage, 
    updateLifeStage, 
    deleteLifeStage 
  } = useLifeStages(selectedSpeciesId === 'all' ? undefined : parseInt(selectedSpeciesId));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLifeStage, setSelectedLifeStage] = useState<LifeStage | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<LifeStageFormData>({
    resolver: zodResolver(lifeStageSchema) as any,
    defaultValues: {
      is_active: true,
      min_age_months: 0,
    },
  });

  const isActive = watch('is_active');

  const handleAdd = () => {
    setSelectedLifeStage(null);
    reset({
      species_id: selectedSpeciesId !== 'all' ? selectedSpeciesId : '',
      life_stage_code: '',
      life_stage_name: '',
      min_age_months: 0,
      max_age_months: null,
      description: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (ls: LifeStage) => {
    setSelectedLifeStage(ls);
    reset({
      species_id: ls.species_id.toString(),
      life_stage_code: ls.life_stage_code,
      life_stage_name: ls.life_stage_name,
      min_age_months: ls.min_age_months,
      max_age_months: ls.max_age_months,
      description: ls.description || '',
      is_active: ls.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (ls: LifeStage) => {
    setSelectedLifeStage(ls);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: LifeStageFormData) => {
    const payload = {
      ...data,
      species_id: parseInt(data.species_id),
    };

    if (selectedLifeStage) {
      updateLifeStage(
        { id: selectedLifeStage.life_stage_id, data: payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createLifeStage(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = () => {
    if (selectedLifeStage) {
      deleteLifeStage(selectedLifeStage.life_stage_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedLifeStage(null);
        },
      });
    }
  };

  const columns: ColumnDef<LifeStage>[] = [
    {
      accessorKey: 'species_name',
      header: 'Species',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.species_name}</Badge>
      ),
    },
    {
      accessorKey: 'life_stage_name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.life_stage_name}</span>
          <span className="text-xs text-muted-foreground">{row.original.life_stage_code}</span>
        </div>
      ),
    },
    {
      header: 'Age Range (Months)',
      cell: ({ row }) => {
        const min = row.original.min_age_months;
        const max = row.original.max_age_months;
        return (
          <div className="text-sm">
            {min} - {max !== null ? max : '∞'}
          </div>
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
          <p className="mt-4 text-sm text-gray-600">Loading life stages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Life Stages Management</h1>
          <p className="text-gray-600 mt-1">Configure age ranges and life stages for each species</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Life Stage
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <Label className="font-semibold">Filter by Species:</Label>
        <Select
          value={selectedSpeciesId}
          onValueChange={setSelectedSpeciesId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Species</SelectItem>
            {species.map((s) => (
              <SelectItem key={s.species_id} value={s.species_id.toString()}>
                {s.species_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={lifeStages}
        searchKey="life_stage_name"
        searchPlaceholder="Search life stages..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedLifeStage ? 'Edit Life Stage' : 'Add New Life Stage'}
            </DialogTitle>
            <DialogDescription>
              Define the age range and details for this life stage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Species *</Label>
              <Controller
                control={control}
                name="species_id"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Species" />
                    </SelectTrigger>
                    <SelectContent>
                      {species.map((s) => (
                        <SelectItem key={s.species_id} value={s.species_id.toString()}>
                          {s.species_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.species_id && (
                <p className="text-sm text-red-600">{errors.species_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="life_stage_code">Code *</Label>
                <Input
                  id="life_stage_code"
                  placeholder="e.g., PUPPY"
                  {...register('life_stage_code')}
                />
                {errors.life_stage_code && (
                  <p className="text-sm text-red-600">{errors.life_stage_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="life_stage_name">Name *</Label>
                <Input
                  id="life_stage_name"
                  placeholder="e.g., Puppy"
                  {...register('life_stage_name')}
                />
                {errors.life_stage_name && (
                  <p className="text-sm text-red-600">{errors.life_stage_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_age_months">Min Age (Months)</Label>
                <Input
                  id="min_age_months"
                  type="number"
                  {...register('min_age_months')}
                />
                {errors.min_age_months && (
                  <p className="text-sm text-red-600">{errors.min_age_months.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_age_months">Max Age (Months)</Label>
                <Input
                  id="max_age_months"
                  type="number"
                  placeholder="∞"
                  {...register('max_age_months')}
                />
                {errors.max_age_months && (
                  <p className="text-sm text-red-600">{errors.max_age_months.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this life stage..."
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
                {selectedLifeStage ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Life Stage</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedLifeStage?.life_stage_name}"? This action
              cannot be undone and will fail if any pets are currently assigned to this stage.
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
