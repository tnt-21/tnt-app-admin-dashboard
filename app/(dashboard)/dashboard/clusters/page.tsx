'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, Phone, Home, RefreshCw, Trash2, PlusCircle, ArrowRightLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';


export default function ClustersPage() {
  const [activeZone, setActiveZone] = useState('A');
  const [clusters, setClusters] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchZoneData = async (zone: string) => {
    setLoading(true);
    try {
      // Fetch clusters
      const resClusters = await apiClient.get(`/clusters/zone/${zone}`);
      if (resClusters.data.success) {
        setClusters(resClusters.data.data);
      }

      // Fetch pending bookings
      const resPending = await apiClient.get(`/clusters/zone/${zone}/pending`);
      if (resPending.data.success) {
        setPendingBookings(resPending.data.data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZoneData(activeZone);
  }, [activeZone]);

  const handleAutoAssign = async (overwrite: boolean) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/clusters/auto-assign', { overwrite });
      if (res.data.success) {
        alert('Auto-assignment completed successfully');
        fetchZoneData(activeZone);
      } else {
        alert(res.data.message || 'Error auto-assigning');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualCluster = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/clusters/manual', { zone: activeZone });
      if (res.data.success) {
        alert('Manual cluster created successfully');
        fetchZoneData(activeZone);
      } else {
        alert(res.data.message || 'Error creating manual cluster');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const confirmAutoAssign = () => {
    if (confirm("Existing bookings found on this day. Do you want to overwrite them?\n\nOK = Yes, overwrite (all become pending, new cluster formed)\nCancel = No, append (only fill remaining slots up to 6)")) {
      handleAutoAssign(true);
    } else {
      handleAutoAssign(false);
    }
  };

  const handleRemoveFromCluster = async (clusterId: string, bookingId: string) => {
    try {
      await apiClient.delete(`/clusters/${clusterId}/booking/${bookingId}`);
      alert('Booking removed from cluster');
      fetchZoneData(activeZone);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleAddToCluster = async (clusterId: string, bookingId: string) => {
    try {
      const res = await apiClient.post(`/clusters/${clusterId}/booking/${bookingId}`);
      if (res.data.success) {
        alert('Booking added to cluster');
        fetchZoneData(activeZone);
      } else {
        alert(res.data.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const zones = [
    { id: 'A', name: 'Zone A (Mon)' },
    { id: 'B', name: 'Zone B (Tue)' },
    { id: 'C', name: 'Zone C (Wed)' },
    { id: 'D', name: 'Zone D (Thu)' },
    { id: 'E', name: 'Zone E (Fri)' },
    { id: 'SAT', name: 'Saturday (Manual)' },
    { id: 'SUN', name: 'Sunday (Manual)' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Zone-based Clusters</h1>
          <p className="text-gray-500 mt-1">Manage service clusters and auto-assign pending bookings based on proximity.</p>
        </div>
        {activeZone !== 'SAT' && activeZone !== 'SUN' ? (
          <Button onClick={confirmAutoAssign} disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Auto-Book Slots
          </Button>
        ) : (
          <Button onClick={handleCreateManualCluster} disabled={loading || clusters.length > 0} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <PlusCircle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Create Weekend Cluster
          </Button>
        )}
      </div>

      <Tabs value={activeZone} onValueChange={setActiveZone}>
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          {zones.map((zone: any) => (
            <TabsTrigger
              key={zone.id}
              value={zone.id}
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6 py-3 font-medium"
            >
              {zone.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {zones.map((zone: any) => (
          <TabsContent key={zone.id} value={zone.id} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Clusters View */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Map className="w-5 h-5 text-blue-500" /> Assigned Clusters
                </h2>
                {clusters.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-white p-4 rounded-lg border">No active clusters for this zone.</p>
                ) : (
                  clusters.map((cluster: any) => (
                    <Card key={cluster.cluster_id} className="overflow-hidden border-blue-100">
                      <CardHeader className="bg-blue-50 py-3 border-b border-blue-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-base text-blue-800">
                          {new Date(cluster.cluster_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </CardTitle>
                        <span className="text-xs font-semibold bg-white text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                          {cluster.bookings.length} / 6 Slots
                        </span>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ul className="divide-y">
                          {cluster.bookings.map((booking: any) => (
                            <li key={booking.booking_id} className="p-4 hover:bg-gray-50 group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">{booking.booking_number} - {booking.service_name}</div>
                                  <div className="text-sm text-gray-700 font-semibold mt-1">{booking.customer_name}</div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Phone className="w-3 h-3" /> {booking.customer_phone}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Home className="w-3 h-3" /> {booking.address}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveFromCluster(cluster.cluster_id, booking.booking_id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </li>
                          ))}
                          {cluster.bookings.length === 0 && (
                            <li className="p-4 text-sm text-gray-500 text-center">Empty cluster</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pending View */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span> Pending Bookings
                </h2>
                {pendingBookings.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-white p-4 rounded-lg border">No pending bookings for this zone.</p>
                ) : (
                  <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                    <ul className="divide-y">
                      {pendingBookings.map((booking: any) => (
                        <li key={booking.booking_id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{booking.booking_number} - {booking.service_name}</div>
                              <div className="text-sm text-gray-700 font-semibold mt-1">{booking.customer_name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Phone className="w-3 h-3" /> {booking.customer_phone}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Home className="w-3 h-3" /> {booking.address}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {clusters.length > 0 && clusters[0].bookings.length < 6 && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
                                  onClick={() => handleAddToCluster(clusters[0].cluster_id, booking.booking_id)}
                                >
                                  <PlusCircle className="w-4 h-4" /> Add
                                </Button>
                              )}
                              {clusters.length > 0 && clusters[0].bookings.length >= 6 && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50 gap-1"
                                  onClick={() => alert('Swap feature requires selecting a booking to replace. This can be implemented in a modal.')}
                                >
                                  <ArrowRightLeft className="w-4 h-4" /> Swap
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
