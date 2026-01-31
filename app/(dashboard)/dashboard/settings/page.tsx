'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Settings as SettingsIcon,
    Users,
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Shield,
    Calendar,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Filter
} from 'lucide-react';
import {
    useSettings,
    useSettingMutations,
    useAdminUsers,
    useAdminUserMutations,
    useAuditLogs,
    useAuditStats
} from '@/hooks/use-settings';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { SettingDialog } from '@/components/dialogs/setting-dialog';
import { AdminUserDialog } from '@/components/dialogs/admin-user-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [auditFilters, setAuditFilters] = useState({
        page: 1,
        limit: 50
    });

    const { data: settingsData, isLoading: isLoadingSettings } = useSettings();
    const { data: adminUsersData, isLoading: isLoadingAdmins } = useAdminUsers({ search: searchTerm });
    const { data: auditData, isLoading: isLoadingAudit } = useAuditLogs(auditFilters);
    const { data: auditStats } = useAuditStats();

    const { deleteSetting, isDeleting } = useSettingMutations();
    const { toggleStatus } = useAdminUserMutations();

    const settings = settingsData?.settings || [];
    const adminUsers = adminUsersData?.admin_users || [];
    const auditLogs = auditData?.logs || [];

    // Filter settings by category
    const filteredSettings = categoryFilter === 'all' 
        ? settings 
        : settings.filter(s => s.category === categoryFilter);

    // Get unique categories
    const categories = ['all', ...new Set(settings.map(s => s.category))];

    // Admin Users Table Columns
    const adminColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'full_name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        {row.original.full_name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium">{row.original.full_name}</p>
                        <p className="text-xs text-muted-foreground">{row.original.email}</p>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => {
                const roleColors: Record<string, string> = {
                    super_admin: 'bg-purple-100 text-purple-700',
                    admin: 'bg-blue-100 text-blue-700',
                    support_agent: 'bg-green-100 text-green-700'
                };
                return (
                    <Badge variant="outline" className={roleColors[row.original.role] || 'bg-gray-100'}>
                        {row.original.role?.replace('_', ' ')}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'department',
            header: 'Department',
            cell: ({ row }) => row.original.department || '-'
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions',
            cell: ({ row }) => {
                const permissions = [];
                if (row.original.can_access_finance) permissions.push('Finance');
                if (row.original.can_manage_users) permissions.push('Users');
                if (row.original.can_manage_caregivers) permissions.push('Caregivers');
                if (row.original.can_manage_content) permissions.push('Content');
                
                return permissions.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                        {permissions.slice(0, 2).map(p => (
                            <Badge key={p} variant="secondary" className="text-xs">
                                {p}
                            </Badge>
                        ))}
                        {permissions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{permissions.length - 2}
                            </Badge>
                        )}
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                );
            }
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'} className={row.original.is_active ? 'bg-green-500' : ''}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            accessorKey: 'joined_date',
            header: 'Joined',
            cell: ({ row }) => format(new Date(row.original.joined_date), 'MMM dd, yyyy')
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <AdminUserDialog adminUser={row.original}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2">
                                <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                        </AdminUserDialog>
                        <DropdownMenuItem
                            className="gap-2"
                            onClick={() => toggleStatus({ id: row.original.admin_id, is_active: !row.original.is_active })}
                        >
                            {row.original.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            {row.original.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    // Audit Logs Table Columns
    const auditColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'created_at',
            header: 'Timestamp',
            cell: ({ row }) => (
                <div className="text-xs">
                    <p className="font-medium">{format(new Date(row.original.created_at), 'MMM dd, yyyy')}</p>
                    <p className="text-muted-foreground">{format(new Date(row.original.created_at), 'HH:mm:ss')}</p>
                </div>
            )
        },
        {
            accessorKey: 'admin_name',
            header: 'Admin',
            cell: ({ row }) => (
                <div>
                    <p className="text-sm font-medium">{row.original.admin_name || 'System'}</p>
                    <p className="text-xs text-muted-foreground">{row.original.admin_email}</p>
                </div>
            )
        },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => {
                const actionColors: Record<string, string> = {
                    CREATE: 'bg-green-100 text-green-700',
                    UPDATE: 'bg-blue-100 text-blue-700',
                    DELETE: 'bg-red-100 text-red-700'
                };
                return (
                    <Badge variant="outline" className={actionColors[row.original.action]}>
                        {row.original.action}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'entity_type',
            header: 'Entity',
            cell: ({ row }) => <span className="font-mono text-xs">{row.original.entity_type}</span>
        },
        {
            accessorKey: 'changes_summary',
            header: 'Changes',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground line-clamp-1">
                    {row.original.changes_summary || '-'}
                </span>
            )
        },
        {
            accessorKey: 'severity',
            header: 'Severity',
            cell: ({ row }) => {
                const severityColors: Record<string, string> = {
                    high: 'bg-red-100 text-red-700',
                    medium: 'bg-yellow-100 text-yellow-700',
                    low: 'bg-gray-100 text-gray-700'
                };
                return (
                    <Badge variant="outline" className={severityColors[row.original.severity]}>
                        {row.original.severity}
                    </Badge>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600 mt-1">Manage application configuration, admin users, and audit logs</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Settings</CardTitle>
                        <SettingsIcon className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{settings.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Admin Users</CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminUsers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {adminUsers.filter(u => u.is_active).length} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Audit Logs</CardTitle>
                        <FileText className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{auditStats?.total_logs || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {auditStats?.unique_admins || 0} unique admins
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">High Severity</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{auditStats?.high_severity || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {auditStats?.medium_severity || 0} medium
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-white border">
                        <TabsTrigger value="general" className="gap-2">
                            <SettingsIcon className="h-4 w-4" />
                            General Settings
                        </TabsTrigger>
                        <TabsTrigger value="admins" className="gap-2">
                            <Users className="h-4 w-4" />
                            Admin Users
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Audit Logs
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === 'general' && (
                        <SettingDialog>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Setting
                            </Button>
                        </SettingDialog>
                    )}

                    {activeTab === 'admins' && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search admins..."
                                    className="pl-9 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <AdminUserDialog>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Admin
                                </Button>
                            </AdminUserDialog>
                        </div>
                    )}
                </div>

                {/* General Settings Tab */}
                <TabsContent value="general" className="mt-0">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Application Settings</CardTitle>
                                <CardDescription>Configure system-wide application settings</CardDescription>
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSettings ? (
                                <div className="space-y-4">
                                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                                </div>
                            ) : filteredSettings.length === 0 ? (
                                <div className="text-center py-12">
                                    <SettingsIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No settings found</p>
                                    <SettingDialog>
                                        <Button variant="outline" className="mt-4">
                                            Create First Setting
                                        </Button>
                                    </SettingDialog>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredSettings.map((setting) => (
                                        <div key={setting.setting_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{setting.setting_key}</p>
                                                    {setting.is_public && (
                                                        <Badge variant="outline" className="text-xs">Public</Badge>
                                                    )}
                                                    <Badge variant="secondary" className="text-xs">
                                                        {setting.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Value: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{setting.setting_value}</span>
                                                    <span className="ml-2">Type: {setting.setting_type}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <SettingDialog setting={setting}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </SettingDialog>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={isDeleting}>
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Setting</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete <strong>{setting.setting_key}</strong>? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => deleteSetting(setting.setting_key)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Admin Users Tab */}
                <TabsContent value="admins" className="mt-0">
                    <Card>
                        <DataTable
                            columns={adminColumns}
                            data={adminUsers}
                            isLoading={isLoadingAdmins}
                        />
                    </Card>
                </TabsContent>

                {/* Audit Logs Tab */}
                <TabsContent value="audit" className="mt-0">
                    <Card>
                        <DataTable
                            columns={auditColumns}
                            data={auditLogs}
                            isLoading={isLoadingAudit}
                        />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
