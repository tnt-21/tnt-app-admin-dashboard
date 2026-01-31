'use client';

import { useState } from 'react';
import { useBookingStatuses } from '@/hooks/use-booking-statuses';
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
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { BookingStatus } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const statusSchema = z.object({
  status_code: z.string().min(1, 'Status code is required').max(30),
  status_name: z.string().min(1, 'Status name is required').max(50),
  status_type: z.string().max(20).optional(),
  display_color: z.string().regex(/^#([A-Fa-f0-8]{6}|[A-Fa-f0-8]{3})$/, 'Invalid hex color').default('#000000'),
  allow_cancellation: z.boolean().default(true),
  allow_reschedule: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

type StatusFormData = z.infer<typeof statusSchema>;

export default function BookingStatusesPage() {
  const { statuses, isLoading, createStatus, updateStatus, deleteStatus } = useBookingStatuses();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema) as any,
    defaultValues: {
      is_active: true,
      allow_cancellation: true,
      allow_reschedule: true,
      display_color: '#3b82f6',
    },
  });

  const isActive = watch('is_active');
  const allowCancellation = watch('allow_cancellation');
  const allowReschedule = watch('allow_reschedule');
  const currentColor = watch('display_color');

  const handleAdd = () => {
    setSelectedStatus(null);
    reset({
      status_code: '',
      status_name: '',
      status_type: '',
      display_color: '#3b82f6',
      allow_cancellation: true,
      allow_reschedule: true,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (status: BookingStatus) => {
    setSelectedStatus(status);
    reset({
      status_code: status.status_code,
      status_name: status.status_name,
      status_type: status.status_type || '',
      display_color: status.display_color || '#3b82f6',
      allow_cancellation: status.allow_cancellation,
      allow_reschedule: status.allow_reschedule,
      is_active: status.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (status: BookingStatus) => {
    setSelectedStatus(status);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: StatusFormData) => {
    if (selectedStatus) {
      updateStatus(
        { id: selectedStatus.status_id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createStatus(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = () => {
    if (selectedStatus) {
      deleteStatus(selectedStatus.status_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedStatus(null);
        },
      });
    }
  };

  const columns: ColumnDef<BookingStatus>[] = [
    {
      accessorKey: 'status_name',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: row.original.display_color || '#000' }} 
          />
          <div className="flex flex-col">
            <span className="font-medium">{row.original.status_name}</span>
            <span className="text-xs text-muted-foreground">{row.original.status_code}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.status_type || 'General'}
        </Badge>
      ),
    },
    {
      accessorKey: 'rules',
      header: 'Permissions',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs">
            {row.original.allow_cancellation ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span>Can Cancel</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {row.original.allow_reschedule ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span>Can Reschedule</span>
          </div>
        </div>
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
          <p className="mt-4 text-sm text-gray-600">Loading statuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Statuses</h1>
          <p className="text-gray-600 mt-1">Define membership workflow and booking state rules</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Status
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={statuses}
        searchKey="status_name"
        searchPlaceholder="Search statuses..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus ? 'Edit Booking Status' : 'Add New Booking Status'}
            </DialogTitle>
            <DialogDescription>
              Set the workflow rules and visual branding for this status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status_code">Code *</Label>
                <Input
                  id="status_code"
                  placeholder="e.g., PENDING"
                  {...register('status_code')}
                />
                {errors.status_code && (
                  <p className="text-sm text-red-600">{errors.status_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_name">Name *</Label>
                <Input
                  id="status_name"
                  placeholder="e.g., Pending"
                  {...register('status_name')}
                />
                {errors.status_name && (
                  <p className="text-sm text-red-600">{errors.status_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_type">Status Type</Label>
              <Input
                id="status_type"
                placeholder="e.g., initial, final, error"
                {...register('status_type')}
              />
            </div>

            <div className="space-y-2">
              <Label>Display Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  type="color"
                  className="h-10 w-20 p-1 cursor-pointer"
                  {...register('display_color')}
                />
                <Input
                  placeholder="#3b82f6"
                  {...register('display_color')}
                  className="flex-1"
                />
              </div>
              <div className="h-4 w-full rounded" style={{ backgroundColor: currentColor }} />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Cancellation</Label>
                  <p className="text-xs text-muted-foreground">User can cancel if in this state</p>
                </div>
                <Switch
                  checked={allowCancellation}
                  onCheckedChange={(checked) => setValue('allow_cancellation', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Reschedule</Label>
                  <p className="text-xs text-muted-foreground">User can reschedule if in this state</p>
                </div>
                <Switch
                  checked={allowReschedule}
                  onCheckedChange={(checked) => setValue('allow_reschedule', checked)}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label>Active Status</Label>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
              </div>
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
                {selectedStatus ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedStatus?.status_name}" status? This action
              cannot be undone and will fail if any bookings are currently in this state.
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
