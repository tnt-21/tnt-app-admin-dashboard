'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverMutations } from '@/hooks/use-caregivers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, User, Briefcase, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';

const caregiverSchema = z.object({
  // Personal Info
  full_name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  city: z.string().min(2, 'City is required'),
  
  // Professional
  experience_years: z.coerce.number().min(0),
  education: z.string().optional(),
  bio: z.string().optional(),
  
  // Banking
  account_number: z.string().min(1, 'Required'),
  ifsc_code: z.string().min(1, 'Required'),
  pan_number: z.string().min(10, 'Invalid PAN').max(10),
  aadhar_number: z.string().min(12, 'Invalid Aadhar').max(12),
  
  // Status
  status: z.string().default('pending'),
});

type CaregiverFormValues = z.infer<typeof caregiverSchema>;

export default function NewCaregiverPage() {
  const router = useRouter();
  const { createCaregiver, isCreating } = useCaregiverMutations();
  const [activeTab, setActiveTab] = useState('personal');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CaregiverFormValues>({
    resolver: zodResolver(caregiverSchema),
    defaultValues: {
      status: 'pending',
    }
  });

  const onSubmit = async (data: CaregiverFormValues) => {
    try {
      await createCaregiver(data);
      router.push('/dashboard/caregivers');
    } catch (error) {
       // Error handled by mutation toast
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Onboard New Caregiver</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Banking & ID
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Finalize
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {/* Personal Information */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic contact details and location.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input id="full_name" {...register('full_name')} placeholder="John Doe" />
                      {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" {...register('phone')} placeholder="+91 9876543210" />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register('city')} placeholder="Pune" />
                      {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Details */}
            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Background</CardTitle>
                  <CardDescription>Experience and qualifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input id="experience_years" type="number" {...register('experience_years')} />
                    {errors.experience_years && <p className="text-xs text-destructive">{errors.experience_years.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education / Certifications</Label>
                    <Input id="education" {...register('education')} placeholder="B.Sc Veterinary Science, Certified Pet Groomer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea id="bio" {...register('bio')} placeholder="Tell us about your experience with pets..." className="min-h-[120px]" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Banking & Identification */}
            <TabsContent value="banking">
              <Card>
                <CardHeader>
                  <CardTitle>Banking & Identification</CardTitle>
                  <CardDescription>Financial details for payouts and verification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Bank Account Number</Label>
                      <Input id="account_number" {...register('account_number')} placeholder="XXXX XXXX XXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc_code">IFSC Code</Label>
                      <Input id="ifsc_code" {...register('ifsc_code')} placeholder="SBIN0001234" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pan_number">PAN Card Number</Label>
                      <Input id="pan_number" {...register('pan_number')} placeholder="ABCDE1234F" />
                      {errors.pan_number && <p className="text-xs text-destructive">{errors.pan_number.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aadhar_number">Aadhar Card Number</Label>
                      <Input id="aadhar_number" {...register('aadhar_number')} placeholder="1234 5678 9012" />
                      {errors.aadhar_number && <p className="text-xs text-destructive">{errors.aadhar_number.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Finalize */}
            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Finalize Onboarding</CardTitle>
                  <CardDescription>Set initial status and review.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="status">Initial Application Status</Label>
                    <Select onValueChange={(v) => setValue('status', v)} defaultValue="pending">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="active">Active (Pre-approved)</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    Once created, the caregiver will be added to the database. They will need to be assigned to services and availability before they can receive bookings.
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t pt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Creating...' : 'Complete Onboarding'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
