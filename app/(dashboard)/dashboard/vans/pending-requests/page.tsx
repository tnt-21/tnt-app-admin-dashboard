'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ServiceRequest {
  request_id: string;
  customer_name: string;
  customer_phone: string;
  pet_name: string;
  service_name: string;
  service_type: string;
  urgency_score: number;
  priority: number;
  tier_name: string;
  tier_code: string;
  address_line1: string;
  city: string;
  days_since_last_service: number;
  status: string;
  created_at: string;
}

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vans/service-requests/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Ensure numeric fields are numbers (Postgres returns decimals as strings)
        const typedRequests = data.data.requests.map((r: any) => ({
          ...r,
          urgency_score: parseFloat(r.urgency_score) || 0,
          priority: parseInt(r.priority) || 3
        }));
        setRequests(typedRequests);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 1.5) return 'high';
    if (score >= 1.0) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierBadgeColor = (tierCode: string) => {
    switch (tierCode) {
      case 'eternal': return 'bg-purple-100 text-purple-800';
      case 'plus': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return getUrgencyLevel(r.urgency_score) === filter;
  });

  const stats = {
    total: requests.length,
    high: requests.filter(r => getUrgencyLevel(r.urgency_score) === 'high').length,
    medium: requests.filter(r => getUrgencyLevel(r.urgency_score) === 'medium').length,
    low: requests.filter(r => getUrgencyLevel(r.urgency_score) === 'low').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Service Requests</h1>
          <p className="text-gray-600 mt-1">Manage and review service requests awaiting route assignment</p>
        </div>
        <Button onClick={fetchPendingRequests}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('all')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('high')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-red-600">{stats.high}</div>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('medium')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Medium Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.medium}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('low')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter indicator */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge variant="outline">Filtered: {filter} urgency</Badge>
          <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>Clear Filter</Button>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No pending requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const urgencyLevel = getUrgencyLevel(request.urgency_score);
            return (
              <Card key={request.request_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${getUrgencyColor(urgencyLevel)}`} />
                        <h3 className="text-lg font-semibold">{request.pet_name}</h3>
                        <Badge className={getTierBadgeColor(request.tier_code)}>
                          {request.tier_name || request.tier_code}
                        </Badge>
                        <span className="text-sm text-gray-500">Priority: {request.priority}</span>
                      </div>

                      {/* Service Info */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{request.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{request.customer_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{request.address_line1}, {request.city}</span>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="font-medium">{request.service_name}</span>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {request.days_since_last_service !== null
                              ? `${request.days_since_last_service} days since last service`
                              : 'First time service'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Urgency Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {request.urgency_score.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Urgency Score
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
