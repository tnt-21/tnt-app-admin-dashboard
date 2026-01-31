'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAdminUserMutations } from '@/hooks/use-settings';
import type { AdminUser } from '@/lib/api/settings';

interface AdminUserDialogProps {
    adminUser?: AdminUser;
    children: React.ReactNode;
}

export function AdminUserDialog({ adminUser, children }: AdminUserDialogProps) {
    const [open, setOpen] = useState(false);
    const { createAdminUser, updateAdminUser, isCreating, isUpdating } = useAdminUserMutations();

    const [formData, setFormData] = useState({
        full_name: adminUser?.full_name || '',
        email: adminUser?.email || '',
        phone: adminUser?.phone || '',
        password: '',
        role: adminUser?.role || 'admin',
        department: adminUser?.department || '',
        can_access_finance: adminUser?.can_access_finance || false,
        can_manage_users: adminUser?.can_manage_users || false,
        can_manage_caregivers: adminUser?.can_manage_caregivers || false,
        can_manage_content: adminUser?.can_manage_content || false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (adminUser) {
                // Update existing admin
                const { password, ...updateData } = formData;
                await updateAdminUser({ id: adminUser.admin_id, data: updateData });
            } else {
                // Create new admin
                await createAdminUser(formData);
            }
            setOpen(false);
            if (!adminUser) {
                // Reset form
                setFormData({
                    full_name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'admin',
                    department: '',
                    can_access_finance: false,
                    can_manage_users: false,
                    can_manage_caregivers: false,
                    can_manage_content: false
                });
            }
        } catch (error) {
            console.error('Failed to save admin user:', error);
        }
    };

    const isLoading = isCreating || isUpdating;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{adminUser ? 'Edit Admin User' : 'Create Admin User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-gray-700">Basic Information</h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    required
                                    disabled={!!adminUser}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1234567890"
                                    required
                                    disabled={!!adminUser}
                                />
                            </div>
                        </div>

                        {!adminUser && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    required={!adminUser}
                                    minLength={8}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="support_agent">Support Agent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g., Operations, Support"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold text-sm text-gray-700">Permissions</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="can_access_finance" className="cursor-pointer">
                                        Access Finance
                                    </Label>
                                    <p className="text-xs text-muted-foreground">View payments, invoices, and revenue</p>
                                </div>
                                <Switch
                                    id="can_access_finance"
                                    checked={formData.can_access_finance}
                                    onCheckedChange={(checked) => setFormData({ ...formData, can_access_finance: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="can_manage_users" className="cursor-pointer">
                                        Manage Users
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Create, edit, and delete users</p>
                                </div>
                                <Switch
                                    id="can_manage_users"
                                    checked={formData.can_manage_users}
                                    onCheckedChange={(checked) => setFormData({ ...formData, can_manage_users: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="can_manage_caregivers" className="cursor-pointer">
                                        Manage Caregivers
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Approve and manage caregiver profiles</p>
                                </div>
                                <Switch
                                    id="can_manage_caregivers"
                                    checked={formData.can_manage_caregivers}
                                    onCheckedChange={(checked) => setFormData({ ...formData, can_manage_caregivers: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="can_manage_content" className="cursor-pointer">
                                        Manage Content
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Edit services, events, and content</p>
                                </div>
                                <Switch
                                    id="can_manage_content"
                                    checked={formData.can_manage_content}
                                    onCheckedChange={(checked) => setFormData({ ...formData, can_manage_content: checked })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : adminUser ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
