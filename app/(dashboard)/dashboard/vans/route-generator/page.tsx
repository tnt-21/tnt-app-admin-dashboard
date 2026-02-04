'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface RouteResult {
  totalRoutes: number;
  totalRequestsAssigned: number;
  routesByDay: Array<{
    date: string;
    routes: Array<{
      schedule: any;
      assignments: any[];
      totalDistanceKm: number;
      efficiencyScore: number;
    }>;
    requestsAssigned: number;
  }>;
}

export default function RouteGeneratorPage() {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [daysAhead, setDaysAhead] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vans/generate-weekly-routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          days_ahead: daysAhead,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Ensure numeric fields are parsed correctly
        const parsedData = {
          ...data.data,
          routesByDay: data.data.routesByDay.map((day: any) => ({
            ...day,
            routes: day.routes.map((route: any) => ({
              ...route,
              totalDistanceKm: Number(route.totalDistanceKm || 0),
              efficiencyScore: Number(route.efficiencyScore || 0)
            }))
          }))
        };
        setResult(parsedData);
      } else {
        setError(data.message || 'Failed to generate routes');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Route Generator</h1>
        <p className="text-gray-600 mt-1">Generate optimized van routes using supply-side optimization</p>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Weekly Routes</CardTitle>
          <CardDescription>
            The system will automatically cluster pending requests by location and assign them to van routes
            based on urgency scores and subscription tiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daysAhead">Number of Days</Label>
              <Input
                id="daysAhead"
                type="number"
                min="1"
                max="14"
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value))}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Generate routes for 1-14 days ahead</p>
            </div>
          </div>

          <Button
            onClick={generateRoutes}
            disabled={loading}
            size="lg"
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Routes...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate Routes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Routes Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-green-600">{result.totalRoutes}</div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Requests Assigned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{result.totalRequestsAssigned}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Requests/Route</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {result.totalRoutes > 0
                      ? (result.totalRequestsAssigned / result.totalRoutes).toFixed(1)
                      : 0}
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Route Breakdown by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.routesByDay.map((day) => (
                  <div key={day.date} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <Badge>{day.requestsAssigned} requests assigned</Badge>
                    </div>

                    {day.routes.length === 0 ? (
                      <p className="text-sm text-gray-500">No routes created for this day</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {day.routes.map((route, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">Route {idx + 1}</span>
                              <Badge variant="outline">{route.assignments.length} stops</Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              Distance: {route.totalDistanceKm.toFixed(1)} km
                            </div>
                            <div className="text-xs text-gray-600">
                              Efficiency: {route.efficiencyScore.toFixed(2)} km/stop
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How Route Generation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>✓ <strong>Urgency-Based:</strong> Requests are prioritized by urgency score (days overdue × tier multiplier)</p>
          <p>✓ <strong>Geographic Clustering:</strong> Groups nearby requests to minimize travel distance</p>
          <p>✓ <strong>TSP Optimization:</strong> Uses nearest-neighbor algorithm to find optimal stop sequence</p>
          <p>✓ <strong>Time Window Fitting:</strong> Ensures routes fit within 9 AM - 6 PM operating hours</p>
          <p>✓ <strong>Tier Priority:</strong> Eternal (1.5x), Plus (1.2x), Basic (1.0x) multipliers</p>
        </CardContent>
      </Card>
    </div>
  );
}
