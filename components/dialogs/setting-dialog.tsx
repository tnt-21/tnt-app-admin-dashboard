'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingMutations } from '@/hooks/use-settings';
import type { AppSetting } from '@/lib/api/settings';

interface SettingDialogProps {
    setting?: AppSetting;
    children: React.ReactNode;
}

export function SettingDialog({ setting, children }: SettingDialogProps) {
    const [open, setOpen] = useState(false);
    const { upsertSetting, isUpserting } = useSettingMutations();

    const [formData, setFormData] = useState({
        setting_key: setting?.setting_key || '',
        setting_value: setting?.setting_value || '',
        setting_type: setting?.setting_type || 'string',
        category: setting?.category || 'general',
        description: setting?.description || '',
        is_public: setting?.is_public || false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await upsertSetting(formData);
            setOpen(false);
            if (!setting) {
                // Reset form for new settings
                setFormData({
                    setting_key: '',
                    setting_value: '',
                    setting_type: 'string',
                    category: 'general',
                    description: '',
                    is_public: false
                });
            }
        } catch (error) {
            console.error('Failed to save setting:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{setting ? 'Edit Setting' : 'Create Setting'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="setting_key">Setting Key *</Label>
                        <Input
                            id="setting_key"
                            value={formData.setting_key}
                            onChange={(e) => setFormData({ ...formData, setting_key: e.target.value })}
                            placeholder="e.g., app_name, maintenance_mode"
                            required
                            disabled={!!setting} // Can't change key for existing settings
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="setting_value">Value *</Label>
                        <Input
                            id="setting_value"
                            value={formData.setting_value}
                            onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                            placeholder="Setting value"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="setting_type">Type</Label>
                            <Select
                                value={formData.setting_type}
                                onValueChange={(value) => setFormData({ ...formData, setting_type: value })}
                            >
                                <SelectTrigger id="setting_type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="string">String</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="payment">Payment</SelectItem>
                                    <SelectItem value="notification">Notification</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this setting"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_public"
                            checked={formData.is_public}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                        />
                        <Label htmlFor="is_public" className="cursor-pointer">
                            Public (visible to non-admin users)
                        </Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpserting}>
                            {isUpserting ? 'Saving...' : setting ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
