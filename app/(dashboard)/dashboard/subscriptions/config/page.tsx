'use client';

import { useState, useEffect } from 'react';
import { useSubscriptionTiers, useTierConfig } from '@/hooks/use-subscription-tiers';
import { useSpecies } from '@/hooks/use-species';
import { useLifeStages } from '@/hooks/use-life-stages';
import { useServiceCategories } from '@/hooks/use-service-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SubscriptionConfigPage() {
    const { tiers } = useSubscriptionTiers();
    const { species } = useSpecies();
    const { lifeStages } = useLifeStages();
    const { categories } = useServiceCategories();

    const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
    const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(null);
    const [selectedLifeStageId, setSelectedLifeStageId] = useState<number | null>(null);

    // Default to first items if available
    useEffect(() => {
        if (tiers.length > 0 && selectedTierId === null) setSelectedTierId(tiers[0].tier_id);
        if (species.length > 0 && selectedSpeciesId === null) setSelectedSpeciesId(species[0].species_id);
        if (lifeStages.length > 0 && selectedLifeStageId === null) setSelectedLifeStageId(lifeStages[0].life_stage_id);
    }, [tiers, species, lifeStages, selectedTierId, selectedSpeciesId, selectedLifeStageId]);

    const { config, isLoading, updateConfig, isUpdating } = useTierConfig(selectedTierId || 0);

    const [localConfig, setLocalConfig] = useState<any[]>([]);

    // Sync local state when config data loads or selection changes
    useEffect(() => {
        if (config) {
            setLocalConfig(config);
        }
    }, [config]);

    const getCategoryConfig = (categoryId: number) => {
        return localConfig.find(c => 
            c.category_id === categoryId && 
            c.species_id === selectedSpeciesId && 
            c.life_stage_id === selectedLifeStageId
        );
    };

    const handleUpdateLocal = (categoryId: number, field: string, value: any) => {
        setLocalConfig(prev => {
            const existingIdx = prev.findIndex(c => 
                c.category_id === categoryId && 
                c.species_id === selectedSpeciesId && 
                c.life_stage_id === selectedLifeStageId
            );

            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = { ...updated[existingIdx], [field]: value };
                return updated;
            } else {
                return [...prev, {
                    tier_id: selectedTierId,
                    species_id: selectedSpeciesId,
                    life_stage_id: selectedLifeStageId,
                    category_id: categoryId,
                    quota_monthly: 0,
                    quota_annual: 0,
                    is_included: false,
                    [field]: value
                }];
            }
        });
    };

    const handleSave = async (categoryId: number) => {
        const item = getCategoryConfig(categoryId);
        if (!item) return;

        try {
            await updateConfig({
                species_id: item.species_id,
                life_stage_id: item.life_stage_id,
                category_id: item.category_id,
                quota_monthly: item.quota_monthly,
                quota_annual: item.quota_annual,
                is_included: item.is_included
            });
        } catch (error) {
            // Error toast handled by hook
        }
    };

    const handleSaveAll = async () => {
        // In a real app we might want a bulk update endpoint, 
        // but here we'll loop through relevant local configs
        const relevantConfigs = localConfig.filter(c => 
            c.species_id === selectedSpeciesId && 
            c.life_stage_id === selectedLifeStageId
        );

        toast.promise(
            Promise.all(relevantConfigs.map(c => updateConfig(c))),
            {
                loading: 'Saving configuration matrix...',
                success: 'All configurations saved successfully',
                error: 'Failed to save some configurations',
            }
        );
    };

    const selectedTier = tiers.find(t => t.tier_id === selectedTierId);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Tier Features Matrix</h1>
                <p className="text-gray-600 mt-1">Configure service quotas and inclusions for each subscription tier</p>
            </div>

            {/* Selection Controls */}
            <Card className="bg-muted/30">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Subscription Tier</Label>
                            <Select value={selectedTierId?.toString()} onValueChange={(v) => setSelectedTierId(parseInt(v))}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select Tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiers.map(t => (
                                        <SelectItem key={t.tier_id} value={t.tier_id.toString()}>
                                            {t.tier_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Species</Label>
                            <Select value={selectedSpeciesId?.toString()} onValueChange={(v) => setSelectedSpeciesId(parseInt(v))}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select Species" />
                                </SelectTrigger>
                                <SelectContent>
                                    {species.map(s => (
                                        <SelectItem key={s.species_id} value={s.species_id.toString()}>
                                            {s.species_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Life Stage</Label>
                            <Select value={selectedLifeStageId?.toString()} onValueChange={(v) => setSelectedLifeStageId(parseInt(v))}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select Life Stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lifeStages.map(ls => (
                                        <SelectItem key={ls.life_stage_id} value={ls.life_stage_id.toString()}>
                                            {ls.life_stage_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Matrix View */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div>
                        <CardTitle className="text-xl">
                            Configuration for {selectedTier?.tier_name}
                        </CardTitle>
                        <CardDescription>
                            Define monthly and annual limits for this specific species and life stage
                        </CardDescription>
                    </div>
                    <Button onClick={handleSaveAll} disabled={isUpdating}>
                        <Save className="h-4 w-4 mr-2" />
                        Save All Changes
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[30%]">Service Category</TableHead>
                                    <TableHead className="w-[15%]">Included?</TableHead>
                                    <TableHead className="w-[20%]">Monthly Quota</TableHead>
                                    <TableHead className="w-[20%]">Annual Quota</TableHead>
                                    <TableHead className="w-[15%] text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => {
                                    const cfg = getCategoryConfig(cat.category_id);
                                    const isIncluded = cfg?.is_included || false;

                                    return (
                                        <TableRow key={cat.category_id} className={cn(!isIncluded && "opacity-60")}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    {cat.icon_url && <img src={cat.icon_url} alt="" className="h-6 w-6 object-contain" />}
                                                    <span>{cat.category_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Switch 
                                                    checked={isIncluded} 
                                                    onCheckedChange={(checked) => handleUpdateLocal(cat.category_id, 'is_included', checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        className="h-8 w-20"
                                                        value={cfg?.quota_monthly || 0}
                                                        onChange={(e) => handleUpdateLocal(cat.category_id, 'quota_monthly', parseInt(e.target.value) || 0)}
                                                        disabled={!isIncluded}
                                                    />
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">uses/mo</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        className="h-8 w-20"
                                                        value={cfg?.quota_annual || 0}
                                                        onChange={(e) => handleUpdateLocal(cat.category_id, 'quota_annual', parseInt(e.target.value) || 0)}
                                                        disabled={!isIncluded}
                                                    />
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">uses/yr</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8"
                                                    onClick={() => handleSave(cat.category_id)}
                                                    disabled={isUpdating}
                                                >
                                                    Update
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-blue-700">
                        <Info className="h-5 w-5 flex-shrink-0" />
                        <div className="text-sm">
                            <strong>Note:</strong> Quotas of 0 indicate unlimited usage for that service if "Included" is active, or no access if inactive. In high-tier plans, usually most services are included with specific limits.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fair Usage Section */}
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Fair Usage Policies (FUP)</CardTitle>
                        <CardDescription>Global limits and abuse prevention rules for {selectedTier?.tier_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="text-base">Cooldown Periods</Label>
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Booking Cooldown</Label>
                                            <p className="text-xs text-muted-foreground">Hours between consecutive bookings</p>
                                        </div>
                                        <Input type="number" className="h-8 w-20" defaultValue={24} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Same Service Cooldown</Label>
                                            <p className="text-xs text-muted-foreground">Days between same service type</p>
                                        </div>
                                        <Input type="number" className="h-8 w-20" defaultValue={7} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base">Access Restrictions</Label>
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Peak Hour Access</Label>
                                            <p className="text-xs text-muted-foreground">Allow booking during peak slots</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Weekend Premium</Label>
                                            <p className="text-xs text-muted-foreground">Apply surcharge for weekend slots</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                             <Button variant="outline">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset FUP Settings
                            </Button>
                            <Button className="ml-2">
                                Save FUP Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
