'use client';

import { useState } from 'react';
import { useTierFUP, useSubscriptionTiers } from '@/hooks/use-subscription-tiers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldAlert, 
  Clock, 
  Zap, 
  Settings, 
  Save, 
  HelpCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function FairUsagePage() {
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const { tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  
  // Set default tier once loaded
  if (!selectedTierId && tiers.length > 0) {
    setSelectedTierId(tiers[0].tier_id.toString());
  }

  const { policies, isLoading, updateFUP, isUpdating } = useTierFUP(
    selectedTierId ? parseInt(selectedTierId) : undefined
  );

  const [localPolicies, setLocalPolicies] = useState<any[]>([]);
  
  // Sync local state when policies load
  useState(() => {
    if (policies.length > 0 && localPolicies.length === 0) {
      setLocalPolicies(policies);
    }
  });

  const handleUpdateField = (policyId: string, field: string, value: any) => {
    setLocalPolicies(prev => prev.map(p => 
      p.policy_id === policyId ? { ...p, [field]: value } : p
    ));
  };

  const handleSavePolicy = async (policy: any) => {
    try {
      await updateFUP({
        id: policy.policy_id,
        data: {
          max_usage_per_month: policy.max_usage_per_month,
          max_usage_per_week: policy.max_usage_per_week,
          max_usage_per_day: policy.max_usage_per_day,
          cooldown_period_days: policy.cooldown_period_days,
          cooldown_period_hours: policy.cooldown_period_hours,
          abuse_threshold: policy.abuse_threshold,
          abuse_action: policy.abuse_action,
          is_active: policy.is_active,
          description: policy.description
        }
      });
    } catch (error) {
      console.error('Failed to update policy:', error);
    }
  };

  if (tiersLoading || (isLoading && policies.length === 0)) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activePolicies = localPolicies.length > 0 ? localPolicies : policies;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fair Usage Policies</h1>
          <p className="text-gray-600 mt-1">Configure usage restrictions and abuse prevention for subscription tiers</p>
        </div>
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Select Tier:</Label>
          <Select value={selectedTierId} onValueChange={setSelectedTierId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choose Tier" />
            </SelectTrigger>
            <SelectContent>
              {tiers.map(tier => (
                <SelectItem key={tier.tier_id} value={tier.tier_id.toString()}>
                  {tier.tier_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activePolicies.map((policy) => (
          <Card key={policy.policy_id} className={!policy.is_active ? 'opacity-60' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{policy.category_name} Limits</CardTitle>
                  <CardDescription>Policies for {policy.tier_name} tier</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${policy.policy_id}`}>Active</Label>
                  <Switch 
                    id={`active-${policy.policy_id}`}
                    checked={policy.is_active}
                    onCheckedChange={(val) => handleUpdateField(policy.policy_id, 'is_active', val)}
                  />
                </div>
                <Button 
                    size="sm" 
                    onClick={() => handleSavePolicy(policy)}
                    disabled={isUpdating}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Zap className="h-4 w-4" /> Usage Caps
                  </h4>
                  <div className="space-y-2">
                    <Label className="text-xs">Max per Day</Label>
                    <Input 
                      type="number" 
                      value={policy.max_usage_per_day || ''} 
                      placeholder="No limit"
                      onChange={(e) => handleUpdateField(policy.policy_id, 'max_usage_per_day', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max per Week</Label>
                    <Input 
                      type="number" 
                      value={policy.max_usage_per_week || ''} 
                      placeholder="No limit"
                      onChange={(e) => handleUpdateField(policy.policy_id, 'max_usage_per_week', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max per Month</Label>
                    <Input 
                      type="number" 
                      value={policy.max_usage_per_month || ''} 
                      placeholder="No limit"
                      onChange={(e) => handleUpdateField(policy.policy_id, 'max_usage_per_month', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4" /> Cooldowns
                  </h4>
                  <div className="space-y-2">
                    <Label className="text-xs">Cooldown (Days)</Label>
                    <Input 
                      type="number" 
                      value={policy.cooldown_period_days || 0} 
                      onChange={(e) => handleUpdateField(policy.policy_id, 'cooldown_period_days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cooldown (Hours)</Label>
                    <Input 
                      type="number" 
                      value={policy.cooldown_period_hours || 0} 
                      onChange={(e) => handleUpdateField(policy.policy_id, 'cooldown_period_hours', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-red-600">
                    <ShieldAlert className="h-4 w-4" /> Abuse Prevention
                  </h4>
                  <div className="space-y-2">
                    <Label className="text-xs">Abuse Threshold (hits/month)</Label>
                    <Input 
                      type="number" 
                      value={policy.abuse_threshold || ''} 
                      placeholder="Not set"
                      onChange={(e) => handleUpdateField(policy.policy_id, 'abuse_threshold', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Action on Abuse</Label>
                    <Select 
                      value={policy.abuse_action || 'none'} 
                      onValueChange={(val) => handleUpdateField(policy.policy_id, 'abuse_action', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="flag">Flag for Review</SelectItem>
                        <SelectItem value="soft_lock">Soft Lock Account</SelectItem>
                        <SelectItem value="hard_lock">Hard Lock Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activePolicies.length === 0 && !isLoading && (
        <div className="p-12 text-center border-2 border-dashed rounded-xl border-gray-100 italic bg-gray-50/50">
          No fair usage policies configured for this tier yet.
        </div>
      )}

      <div className="p-4 bg-muted/40 rounded-lg border flex gap-4 items-center">
        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border shadow-sm flex-shrink-0">
          <HelpCircle className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Need help with policies?</h4>
          <p className="text-xs text-muted-foreground">Changes to Fair Usage Policies affect all active subscriptions immediately after the next system sync. Use caution when reducing limits.</p>
        </div>
      </div>
    </div>
  );
}
