"use client";

import { useParams, useRouter } from "next/navigation";
import { useCareManager, useCareManagerAssignments, useAssignmentInteractions, useAddInteraction, useUnassignPet, useAssignPet } from "@/hooks/use-care-managers";
import { useQuery } from "@tanstack/react-query";
import { careManagersAPI } from "@/lib/api/care-managers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Calendar, 
  MessageSquare, 
  Plus, 
  UserMinus, 
  History,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  UserCircle,
  Languages
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

const interactionSchema = z.object({
  interaction_type: z.string().min(1, "Type is required"),
  duration_minutes: z.coerce.number().min(1, "Duration is required"),
  summary: z.string().min(5, "Summary is too short"),
  next_follow_up_date: z.string().optional(),
});

export default function CareManagerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const { data: managerData, isLoading: isManagerLoading } = useCareManager(id);
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useCareManagerAssignments(id);
  
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const { data: interactionsData, isLoading: isInteractionsLoading } = useAssignmentInteractions(activeAssignmentId || "");
  
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const { mutate: addInteraction, isPending: isAddingInteraction } = useAddInteraction();
  const { mutate: unassignPet } = useUnassignPet();

  const { data: unassignedData } = useQuery({
    queryKey: ["unassigned-subscriptions"],
    queryFn: () => careManagersAPI.getUnassignedSubscriptions(),
  });
  const unassignedSubscriptions = unassignedData?.data || [];
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { mutate: assignPet, isPending: isAssigningPet } = useAssignPet();

  const handleAssignPet = (subscription: any) => {
    assignPet({ 
      id, 
      assignmentData: { 
        subscriptionId: subscription.subscription_id, 
        petId: subscription.pet_id, 
        userId: subscription.user_id 
      } 
    }, {
      onSuccess: () => {
        setIsAssignModalOpen(false);
        toast.success("Pet assigned successfully");
      }
    });
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_type: "Check-in Call",
      duration_minutes: 15,
      summary: "",
      next_follow_up_date: "",
    },
  });

  const onSubmitInteraction = (data: any) => {
    if (!activeAssignmentId) return;
    addInteraction({ assignmentId: activeAssignmentId, data }, {
      onSuccess: () => {
        setIsInteractionModalOpen(false);
        reset();
      }
    });
  };

  if (isManagerLoading) return <div className="p-8">Loading care manager details...</div>;
  if (!managerData?.data?.careManager) return <div className="p-8">Care manager not found.</div>;

  const careManager = managerData.data.careManager;
  const assignments = assignmentsData?.data || [];
  const interactions = interactionsData?.data || [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{careManager.full_name}</h1>
          <p className="text-muted-foreground">Managing {careManager.current_pets_count} / {careManager.max_pets} pets</p>
        </div>
        <Badge className="ml-2" variant={careManager.status === 'active' ? 'default' : 'secondary'}>
          {careManager.status.toUpperCase()}
        </Badge>
      </div>
      <div className="h-px bg-border w-full" />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignments?.length || 0})</TabsTrigger>
          <TabsTrigger value="performance">Performance & Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{careManager.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{careManager.specialization}</p>
                    <div className="flex items-center gap-1 mt-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{careManager.average_satisfaction_score ? parseFloat(careManager.average_satisfaction_score).toFixed(1) : "New"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{careManager.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{careManager.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(careManager.joined_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span>{careManager.languages_spoken?.join(", ") || "English"}</span>
                  </div>
                </div>

                <div className="h-px bg-border w-full" />

                <div>
                  <h4 className="text-sm font-semibold mb-2">Qualifications</h4>
                  <p className="text-sm text-muted-foreground">{careManager.qualifications}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Current Assignments Overview</CardTitle>
                <CardDescription>Pets currently under this manager's care.</CardDescription>
              </CardHeader>
              <CardContent>
                {isAssignmentsLoading ? (
                  <p>Loading assignments...</p>
                ) : assignments?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No pets assigned yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push(`/dashboard/care-managers/${id}#assignments`)}>
                      Assign First Pet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments?.slice(0, 5).map((assignment: any) => (
                      <div key={assignment.assignment_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{assignment.pet_name}</p>
                            <p className="text-xs text-muted-foreground">Owner: {assignment.owner_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">Last Check-in</p>
                          <p className="text-xs text-muted-foreground">{assignment.last_check_in_date ? new Date(assignment.last_check_in_date).toLocaleDateString() : "Never"}</p>
                        </div>
                      </div>
                    ))}
                    {assignments?.length > 5 && (
                      <Button variant="ghost" className="w-full text-xs" onClick={() => setActiveAssignmentId(assignments[0].assignment_id)}>
                        View All Assignments
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Pet Assignments</CardTitle>
                <CardDescription>Manage pets assigned to {careManager.full_name}.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsAssignModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Assign New Pet
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments?.map((assignment: any) => (
                  <Card key={assignment.assignment_id} className={activeAssignmentId === assignment.assignment_id ? "border-blue-500 ring-1 ring-blue-500" : ""}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/10">
                            <UserCircle className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg">{assignment.pet_name}</h4>
                              <Badge variant="outline" className="text-[10px] h-4">ETERNAL</Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {assignment.owner_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Assigned: {new Date(assignment.assignment_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <History className="h-3 w-3" /> Freq: {assignment.check_in_frequency || "Weekly"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setActiveAssignmentId(assignment.assignment_id);
                              setIsInteractionModalOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" /> Add Interaction
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-blue-600"
                            onClick={() => setActiveAssignmentId(assignment.assignment_id)}
                          >
                            <History className="h-4 w-4 mr-2" /> History
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm("Are you sure you want to unassign this pet?")) {
                                unassignPet({ assignmentId: assignment.assignment_id, reason: "Administrative change" });
                              }
                            }}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* History Section (Expandable) */}
                      {activeAssignmentId === assignment.assignment_id && (
                        <div className="mt-6 pt-6 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between mb-4">
                             <h5 className="text-sm font-bold flex items-center gap-2">
                               <History className="h-4 w-4" /> Interaction History
                             </h5>
                             <Button variant="ghost" size="xs" onClick={() => setActiveAssignmentId(null)}>Hide</Button>
                          </div>
                          
                          {isInteractionsLoading ? (
                             <p className="text-xs text-muted-foreground">Loading history...</p>
                          ) : interactions?.length === 0 ? (
                             <p className="text-xs text-muted-foreground py-4 text-center">No interaction logs found for this assignment.</p>
                          ) : (
                            <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-purple-500 before:to-transparent">
                              {interactions?.map((interaction: any) => (
                                <div key={interaction.interaction_id} className="relative pl-10">
                                  <div className="absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm ring-1 ring-border">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  </div>
                                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <Badge variant="secondary" className="text-[10px]">{interaction.interaction_type}</Badge>
                                      <span className="text-[10px] text-muted-foreground">{new Date(interaction.interaction_date).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm">{interaction.summary}</p>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                                      <span>Logged by: {interaction.created_by_name}</span>
                                      {interaction.duration_minutes && <span>• {interaction.duration_minutes} mins</span>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interaction Modal */}
      <Dialog open={isInteractionModalOpen} onOpenChange={setIsInteractionModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Care Interaction</DialogTitle>
            <DialogDescription>
              Record the details of your latest interaction with the pet parent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitInteraction)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interaction Type</Label>
                <Input {...register("interaction_type")} />
                {errors.interaction_type && <p className="text-xs text-destructive">{errors.interaction_type.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Duration (mins)</Label>
                <Input type="number" {...register("duration_minutes", { valueAsNumber: true })} />
                {errors.duration_minutes && <p className="text-xs text-destructive">{errors.duration_minutes.message as string}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Interaction Summary</Label>
              <Textarea {...register("summary")} placeholder="Discussed pet diet, updated vaccination records..." className="min-h-[100px]" />
              {errors.summary && <p className="text-xs text-destructive">{errors.summary.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>Next Follow-up (Optional)</Label>
              <Input type="date" {...register("next_follow_up_date")} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsInteractionModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isAddingInteraction}>
                {isAddingInteraction ? "Logging..." : "Save Interaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
