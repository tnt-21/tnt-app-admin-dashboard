'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, MapPin, Clock, User, Calendar as CalendarIcon } from 'lucide-react';

interface Van {
  van_id: string;
  van_number: string;
  van_name: string;
  zone: string;
  schedule_id?: string;
  schedule_status?: string;
  start_time?: string;
  end_time?: string;
  assignment_count?: number;
}

interface Assignment {
  request_id: string;
  customer_name: string;
  pet_name: string;
  service_name: string;
  address_line1: string;
  city: string;
  route_sequence: number;
  estimated_arrival_time: string;
  estimated_departure_time: string;
  urgency_score: number;
}

export default function VanSchedulesPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [vans, setVans] = useState<Van[]>([]);
  const [selectedVan, setSelectedVan] = useState<Van | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVans();
  }, [selectedDate]);

  const fetchVans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vans?date=${selectedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setVans(data.data.vans);
      }
    } catch (error) {
      console.error('Error fetching vans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vans/schedules/${scheduleId}/assignments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Ensure numeric fields are parsed correctly
        const parsedAssignments = data.data.assignments.map((assignment: any) => ({
          ...assignment,
          urgency_score: Number(assignment.urgency_score || 0),
          route_sequence: Number(assignment.route_sequence || 0)
        }));
        setAssignments(parsedAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const selectVan = async (van: Van) => {
    setSelectedVan(van);
    if (van.schedule_id) {
      await fetchAssignments(van.schedule_id);
    } else {
      setAssignments([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Van Schedules</h1>
          <p className="text-gray-600 mt-1">View and manage daily van routes and assignments</p>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleDate">Select Date</Label>
              <Input
                id="scheduleDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={fetchVans} className="mt-8">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Van List and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Van List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Vans ({vans.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : vans.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No vans found</p>
            ) : (
              vans.map((van) => (
                <div
                  key={van.van_id}
                  onClick={() => selectVan(van)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedVan?.van_id === van.van_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="font-semibold">{van.van_name}</div>
                      <div className="text-sm text-gray-600">#{van.van_number}</div>
                    </div>
                    {van.assignment_count !== undefined && van.assignment_count > 0 && (
                      <Badge>{van.assignment_count} stops</Badge>
                    )}
                  </div>
                  {van.zone && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {van.zone}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Route Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedVan
                ? `${selectedVan.van_name} - ${new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}`
                : 'Select a van to view route details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedVan ? (
              <div className="text-center py-12 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Select a van from the list to view its route and assignments</p>
              </div>
            ) : !selectedVan.schedule_id ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No route scheduled for this van on {selectedDate}</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No stops assigned for this route</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Schedule Info */}
                {selectedVan.start_time && selectedVan.end_time && (
                  <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4 mb-4">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Operating Hours</div>
                      <div className="text-sm text-blue-700">
                        {selectedVan.start_time} - {selectedVan.end_time}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignments List */}
                <div className="space-y-2">
                  {assignments
                    .sort((a, b) => a.route_sequence - b.route_sequence)
                    .map((assignment, idx) => (
                      <div
                        key={assignment.request_id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        {/* Sequence Number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {assignment.route_sequence}
                        </div>

                        {/* Assignment Details */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-semibold">{assignment.pet_name}</h4>
                            <p className="text-sm text-gray-600">{assignment.service_name}</p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {assignment.customer_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {assignment.address_line1}, {assignment.city}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              Arrival: {assignment.estimated_arrival_time}
                            </div>
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Departure: {assignment.estimated_departure_time}
                            </div>
                            <div className="text-gray-500">
                              Urgency: {assignment.urgency_score.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
