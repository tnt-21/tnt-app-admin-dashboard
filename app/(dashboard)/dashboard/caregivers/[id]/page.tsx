'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCaregiverDetails, useCaregiverMutations } from '@/hooks/use-caregivers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, 
    Star, 
    MapPin, 
    Briefcase, 
    Mail, 
    Phone, 
    Calendar as CalendarIcon,
    ShieldCheck,
    Edit,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function CaregiverDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { caregiver, isLoading } = useCaregiverDetails(id as string);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-32" />
                <div className="flex gap-6">
                    <Skeleton className="h-40 w-40 rounded-full" />
                    <div className="flex-1 space-y-4 pt-4">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!caregiver) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold">Caregiver Not Found</h2>
                <Button onClick={() => router.push('/dashboard/caregivers')}>Back to List</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Caregivers
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                    <Badge variant={caregiver.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1">
                        {caregiver.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
                    <span className="text-4xl font-bold text-blue-600">
                        {caregiver.full_name?.charAt(0)}
                    </span>
                </div>
                <div className="flex-1 space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900">{caregiver.full_name}</h1>
                    <div className="flex flex-wrap gap-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            {caregiver.email}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            {caregiver.phone}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {caregiver.city}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold border border-yellow-100">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            {caregiver.rating || '0.0'}
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <div className="text-sm font-medium text-gray-700">
                            {caregiver.experience_years} Years Experience
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <div className="text-sm text-muted-foreground">
                            Joined {format(new Date(caregiver.created_at), 'MMMM yyyy')}
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 p-0 gap-8">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-3 shadow-none">Overview</TabsTrigger>
                    <TabsTrigger value="specializations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-3 shadow-none">Specializations</TabsTrigger>
                    <TabsTrigger value="availability" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-3 shadow-none">Availability</TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-2 py-3 shadow-none">Documents & ID</TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>About {caregiver.full_name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                                        {caregiver.bio || 'No bio provided.'}
                                    </div>
                                    <div className="pt-4 space-y-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Professional Qualifications
                                        </h4>
                                        <p className="text-sm text-gray-600">{caregiver.education || 'Not Specified'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Total Bookings</span>
                                        <div className="text-2xl font-bold">42</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Completion Rate</span>
                                        <div className="text-2xl font-bold text-green-600">98%</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Total Earnings (MTD)</span>
                                        <div className="text-2xl font-bold">₹15,400</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="specializations">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Active Specializations</CardTitle>
                                    <CardDescription>Services this caregiver is eligible to perform.</CardDescription>
                                </div>
                                <Button size="sm">Add Specialization</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {caregiver.specializations?.length > 0 ? (
                                        caregiver.specializations.map((spec: string, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-orange-50 flex items-center justify-center">
                                                        <ShieldCheck className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <span className="font-medium">{spec}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground italic">
                                            No specializations assigned yet.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="availability">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Weekly Schedule</CardTitle>
                                    <CardDescription>Configured working hours across weekdays.</CardDescription>
                                </div>
                                <Button size="sm">Update Schedule</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                        <div key={day} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50/30">
                                            <span className="font-medium text-sm w-24">{day}</span>
                                            <div className="flex gap-4 items-center">
                                                <Badge variant="outline" className="bg-white">09:00 AM - 06:00 PM</Badge>
                                                <span className="text-xs text-green-600 font-medium">Available</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identification</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                        <span className="text-sm font-medium">Aadhar Card</span>
                                        <span className="text-sm font-mono truncate ml-4">{caregiver.aadhar_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                        <span className="text-sm font-medium">PAN Card</span>
                                        <span className="text-sm font-mono">{caregiver.pan_number}</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Banking Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                        <span className="text-sm font-medium">Account Number</span>
                                        <span className="text-sm font-mono">{caregiver.account_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                        <span className="text-sm font-medium">IFSC Code</span>
                                        <span className="text-sm font-mono">{caregiver.ifsc_code}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
