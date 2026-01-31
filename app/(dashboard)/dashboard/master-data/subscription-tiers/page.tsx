'use client';

import { useState } from 'react';
import { useSubscriptionTiers } from '@/hooks/use-subscription-tiers';
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
import { Plus, Pencil, Trash2, Tag, Layers } from 'lucide-react';
import type { SubscriptionTier } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUpload } from '@/components/forms/file-upload';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const tierSchema = z.object({
  tier_code: z.string().min(1, 'Tier code is required').max(20),
  tier_name: z.string().min(1, 'Tier name is required').max(50),
  tier_description: z.string().max(500).optional(),
  marketing_tagline: z.string().max(255).optional(),
  base_price: z.coerce.number().min(0, 'Base price must be 0 or more'),
  display_order: z.coerce.number().int().min(0, 'Display order must be 0 or more'),
  icon_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  color_hex: z.string().regex(/^#([A-Fa-f0-8]{6}|[A-Fa-f0-8]{3})$/, 'Invalid hex color').default('#000000'),
  is_active: z.boolean().default(true),
});

type TierFormData = z.infer<typeof tierSchema>;

export default function SubscriptionTiersPage() {
  const { tiers, isLoading, createTier, updateTier, deleteTier } = useSubscriptionTiers();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TierFormData>({
    resolver: zodResolver(tierSchema) as any,
    defaultValues: {
      is_active: true,
      base_price: 0,
      display_order: 0,
      color_hex: '#3b82f6',
    },
  });

  const isActive = watch('is_active');
  const currentColor = watch('color_hex');

  const handleAdd = () => {
    setSelectedTier(null);
    reset({
      tier_code: '',
      tier_name: '',
      tier_description: '',
      marketing_tagline: '',
      base_price: 0,
      display_order: tiers.length + 1,
      icon_url: '',
      color_hex: '#3b82f6',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    reset({
      tier_code: tier.tier_code,
      tier_name: tier.tier_name,
      tier_description: tier.tier_description || '',
      marketing_tagline: tier.marketing_tagline || '',
      base_price: Number(tier.base_price),
      display_order: tier.display_order,
      icon_url: tier.icon_url || '',
      color_hex: tier.color_hex || '#3b82f6',
      is_active: tier.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: TierFormData) => {
    if (selectedTier) {
      updateTier(
        { id: selectedTier.tier_id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createTier(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = () => {
    if (selectedTier) {
      deleteTier(selectedTier.tier_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedTier(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading tiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Tiers</h1>
          <p className="text-gray-600 mt-1">Manage membership tiers and their basic pricing</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.tier_id} className="relative overflow-hidden border-2" style={{ borderColor: tier.color_hex }}>
            <div 
              className="h-2 w-full absolute top-0 left-0" 
              style={{ backgroundColor: tier.color_hex }}
            />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  {tier.icon_url ? (
                    <img src={tier.icon_url} alt="" className="h-10 w-10 object-contain rounded" />
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <Layers className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">{tier.tier_name}</CardTitle>
                    <CardDescription>{tier.tier_code}</CardDescription>
                  </div>
                </div>
                <Badge variant={tier.is_active ? 'default' : 'secondary'}>
                  {tier.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">₹{Number(tier.base_price).toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              
              {tier.marketing_tagline && (
                <div className="flex gap-2 items-start text-sm italic text-blue-600 font-medium">
                  <Tag className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{tier.marketing_tagline}</span>
                </div>
              )}
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {tier.tier_description || 'No description provided.'}
              </p>
              
              <div className="pt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-gray-100 rounded">Display Order: {tier.display_order}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(tier)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(tier)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTier ? 'Edit Subscription Tier' : 'Add New Subscription Tier'}
            </DialogTitle>
            <DialogDescription>
              Configure the branding, pricing, and basic info for this tier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column: Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tier_name">Tier Name *</Label>
                  <Input
                    id="tier_name"
                    placeholder="e.g., Plus"
                    {...register('tier_name')}
                  />
                  {errors.tier_name && (
                    <p className="text-sm text-red-600">{errors.tier_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier_code">Tier Code *</Label>
                  <Input
                    id="tier_code"
                    placeholder="e.g., PLUS"
                    {...register('tier_code')}
                  />
                  {errors.tier_code && (
                    <p className="text-sm text-red-600">{errors.tier_code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketing_tagline">Marketing Tagline</Label>
                  <Input
                    id="marketing_tagline"
                    placeholder="e.g., Best for growing puppies"
                    {...register('marketing_tagline')}
                  />
                  {errors.marketing_tagline && (
                    <p className="text-sm text-red-600">{errors.marketing_tagline.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Base Price *</Label>
                    <Input
                      id="base_price"
                      type="number"
                      step="0.01"
                      {...register('base_price')}
                    />
                    {errors.base_price && (
                      <p className="text-sm text-red-600">{errors.base_price.message}</p>
                    )}
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
                </div>
              </div>

              {/* Right Column: Branding & Media */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Branding Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="color"
                      className="h-10 w-20 p-1 cursor-pointer"
                      {...register('color_hex')}
                    />
                    <Input
                      placeholder="#3b82f6"
                      {...register('color_hex')}
                      className="flex-1"
                    />
                  </div>
                  <div className="h-6 w-full rounded mt-1" style={{ backgroundColor: currentColor }} />
                  {errors.color_hex && (
                    <p className="text-sm text-red-600">{errors.color_hex.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Controller
                    control={control}
                    name="icon_url"
                    render={({ field }) => (
                      <FileUpload
                        label="Tier Icon"
                        value={field.value}
                        onChange={field.onChange}
                        folder="tier-icons"
                      />
                    )}
                  />
                  {errors.icon_url && (
                    <p className="text-sm text-red-600">{errors.icon_url.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier_description">Description</Label>
              <Textarea
                id="tier_description"
                placeholder="Describe what's included in this tier..."
                className="h-24"
                {...register('tier_description')}
              />
              {errors.tier_description && (
                <p className="text-sm text-red-600">{errors.tier_description.message}</p>
              )}
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
                {selectedTier ? 'Update Tier' : 'Create Tier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Tier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{selectedTier?.tier_name}" tier? This action
              cannot be undone and will fail if any customers are currently subscribed to this tier.
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
