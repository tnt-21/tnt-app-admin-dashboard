'use client';

import { useState } from 'react';
import { useUserRoles } from '@/hooks/use-user-roles';
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
import { Plus, Pencil, Trash2, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import type { UserRole } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const roleSchema = z.object({
  role_code: z.string().min(1, 'Role code is required').max(30),
  role_name: z.string().min(1, 'Role name is required').max(50),
  permissions: z.record(z.any()).default({}),
  is_active: z.boolean().default(true),
});

type RoleFormData = z.infer<typeof roleSchema>;

const AVAILABLE_MODULES = [
  { id: 'master_data', label: 'Master Data' },
  { id: 'services', label: 'Services' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'users', label: 'Users' },
  { id: 'caregivers', label: 'Caregivers' },
  { id: 'care_managers', label: 'Care Managers' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'payments', label: 'Payments' },
  { id: 'community', label: 'Community' },
  { id: 'support', label: 'Support' },
  { id: 'promo_codes', label: 'Promo Codes' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

const PERMISSION_TYPES = [
  { id: 'view', label: 'View' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
];

export default function UserRolesPage() {
  const { roles, isLoading, createRole, updateRole, deleteRole } = useUserRoles();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema) as any,
    defaultValues: {
      is_active: true,
      permissions: {},
    },
  });

  const isActive = watch('is_active');
  const currentPermissions = watch('permissions') || {};

  const handleAdd = () => {
    setSelectedRole(null);
    reset({
      role_code: '',
      role_name: '',
      permissions: {},
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (role: UserRole) => {
    setSelectedRole(role);
    reset({
      role_code: role.role_code,
      role_name: role.role_name,
      permissions: role.permissions || {},
      is_active: role.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (role: UserRole) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const togglePermission = (moduleId: string, permissionType: string) => {
    const updatedPermissions = { ...currentPermissions };
    if (!updatedPermissions[moduleId]) {
      updatedPermissions[moduleId] = {};
    }
    
    updatedPermissions[moduleId][permissionType] = !updatedPermissions[moduleId][permissionType];
    setValue('permissions', updatedPermissions, { shouldDirty: true });
  };

  const onSubmit = (data: RoleFormData) => {
    if (selectedRole) {
      updateRole(
        { id: selectedRole.role_id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createRole(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteRole(selectedRole.role_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedRole(null);
        },
      });
    }
  };

  const columns: ColumnDef<UserRole>[] = [
    {
      accessorKey: 'role_name',
      header: 'Role',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-1 leading-none rounded bg-blue-50 text-blue-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.role_name}</span>
            <span className="text-xs text-muted-foreground">{row.original.role_code}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const perms = row.original.permissions || {};
        const moduleCount = Object.keys(perms).length;
        return (
          <span className="text-sm text-gray-600">
            {moduleCount} modules configured
          </span>
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
          <p className="mt-4 text-sm text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Roles</h1>
          <p className="text-gray-600 mt-1">Manage system roles and their permission matrices</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        searchKey="role_name"
        searchPlaceholder="Search roles..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? 'Edit User Role' : 'Add New User Role'}
            </DialogTitle>
            <DialogDescription>
              Configure specific permissions for this role across all system modules.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_code">Role Code *</Label>
                <Input
                  id="role_code"
                  placeholder="e.g., SUPPORT_AGENT"
                  {...register('role_code')}
                />
                {errors.role_code && (
                  <p className="text-sm text-red-600">{errors.role_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_name">Role Name *</Label>
                <Input
                  id="role_name"
                  placeholder="e.g., Support Agent"
                  {...register('role_name')}
                />
                {errors.role_name && (
                  <p className="text-sm text-red-600">{errors.role_name.message}</p>
                )}
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Permission Matrix</Label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Module</th>
                      {PERMISSION_TYPES.map(type => (
                        <th key={type.id} className="text-center px-4 py-3 font-medium text-gray-600 w-24">
                          {type.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {AVAILABLE_MODULES.map(module => (
                      <tr key={module.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium">{module.label}</td>
                        {PERMISSION_TYPES.map(type => {
                          const isChecked = currentPermissions[module.id]?.[type.id];
                          return (
                            <td key={type.id} className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(module.id, type.id)}
                                className="inline-flex items-center justify-center"
                              >
                                {isChecked ? (
                                  <CheckSquare className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-300" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                {selectedRole ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedRole?.role_name}" role? This action
              cannot be undone and will fail if any users are currently assigned to this role.
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
