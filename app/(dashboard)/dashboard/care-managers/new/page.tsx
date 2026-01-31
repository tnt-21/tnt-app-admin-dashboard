"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCareManager } from "@/hooks/use-care-managers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User, Briefcase, GraduationCap, Languages, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const careManagerSchema = z.object({
  full_name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
  date_of_birth: z.string().optional(),
  specialization: z.string().min(2, "Specialization is required"),
  qualifications: z.string().min(2, "Qualifications are required"),
  experience_years: z.number().min(0, "Experience years is required"),
  max_pets: z.number().min(1, "Max pets must be at least 1"),
  languages_spoken: z.string().min(1, "At least one language is required"),
  status: z.string(),
});

type CareManagerFormValues = z.infer<typeof careManagerSchema>;

export default function NewCareManagerPage() {
  const router = useRouter();
  const { mutate: createCareManager, isPending } = useCreateCareManager();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CareManagerFormValues>({
    resolver: zodResolver(careManagerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      specialization: "",
      qualifications: "",
      experience_years: 0,
      max_pets: 50,
      languages_spoken: "",
      status: "active",
    }
  });

  const onSubmit = (data: CareManagerFormValues) => {
    createCareManager(data, {
      onSuccess: () => {
        router.push("/dashboard/care-managers");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Care Manager</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
          {/* Section 1: Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Basic contact details for the care manager.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...register("full_name")} placeholder="Jane Smith" />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="jane.smith@example.com" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...register("phone")} placeholder="+91 9876543210" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Professional Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-500" />
                <CardTitle>Professional Details</CardTitle>
              </div>
              <CardDescription>Qualifications and domain expertise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" {...register("specialization")} placeholder="Canine Behavior, Senior Pet Care" />
                  {errors.specialization && <p className="text-xs text-destructive">{errors.specialization.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                   <Input 
                    id="experience_years" 
                    type="number" 
                    {...register("experience_years", { valueAsNumber: true })} 
                  />
                  {errors.experience_years && <p className="text-xs text-destructive">{errors.experience_years.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea id="qualifications" {...register("qualifications")} placeholder="B.Sc Zoology, Certified Dog Trainer (CPDT-KA)" />
                {errors.qualifications && <p className="text-xs text-destructive">{errors.qualifications.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Capacity & Languages */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-500" />
                <CardTitle>Capacity & Preferences</CardTitle>
              </div>
              <CardDescription>Management limits and communication skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_pets">Maximum Pet Capacity</Label>
                   <Input 
                    id="max_pets" 
                    type="number" 
                    {...register("max_pets", { valueAsNumber: true })} 
                  />
                  <p className="text-[10px] text-muted-foreground">Default is 50 pets per manager.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages_spoken">Languages Spoken (comma separated)</Label>
                  <Input id="languages_spoken" {...register("languages_spoken")} placeholder="English, Hindi, Marathi" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select onValueChange={(v) => setValue("status", v)} defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Care Manager
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
