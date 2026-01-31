import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { careManagersAPI, CareManager, CareManagerAssignment, CareManagerInteraction } from "../lib/api/care-managers";
import { toast } from "sonner";

export function useCareManagers(params?: any) {
    return useQuery({
        queryKey: ["care-managers", params],
        queryFn: () => careManagersAPI.getAll(params),
    });
}

export function useCareManager(id: string) {
    return useQuery({
        queryKey: ["care-manager", id],
        queryFn: () => careManagersAPI.getById(id),
        enabled: !!id,
    });
}

export function useCareManagerAssignments(id: string) {
    return useQuery({
        queryKey: ["care-manager-assignments", id],
        queryFn: () => careManagersAPI.getAssignments(id),
        enabled: !!id,
    });
}

export function useAssignmentInteractions(assignmentId: string) {
    return useQuery({
        queryKey: ["assignment-interactions", assignmentId],
        queryFn: () => careManagersAPI.getInteractions(assignmentId),
        enabled: !!assignmentId,
    });
}

export function useCreateCareManager() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => careManagersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["care-managers"] });
            toast.success("Care manager created successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create care manager");
        },
    });
}

export function useUpdateCareManager() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => careManagersAPI.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["care-managers"] });
            queryClient.invalidateQueries({ queryKey: ["care-manager", variables.id] });
            toast.success("Care manager updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update care manager");
        },
    });
}

export function usePromoteToCareManager() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: any }) => careManagersAPI.promote(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["care-managers"] });
            toast.success("User promoted to care manager successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to promote user");
        },
    });
}

export function useAssignPet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, assignmentData }: { id: string; assignmentData: { subscriptionId: string; petId: string; userId: string } }) =>
            careManagersAPI.assignPet(id, assignmentData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["care-manager-assignments", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["care-manager", variables.id] });
            toast.success("Pet assigned successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to assign pet");
        },
    });
}

export function useUnassignPet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) =>
            careManagersAPI.unassignPet(assignmentId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["care-manager-assignments"] });
            queryClient.invalidateQueries({ queryKey: ["care-manager"] });
            toast.success("Pet unassigned successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to unassign pet");
        },
    });
}

export function useAddInteraction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
            careManagersAPI.addInteraction(assignmentId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["assignment-interactions", variables.assignmentId] });
            toast.success("Interaction logged successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to log interaction");
        },
    });
}
