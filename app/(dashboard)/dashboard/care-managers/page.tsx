"use client";

import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Users, Shield, Star, BarChart3, UserCircle } from "lucide-react";
import Link from "next/link";
import { useCareManagers } from "@/hooks/use-care-managers";
import { Badge } from "@/components/ui/badge";

// Define columns inside the component or as a separate constant
import { ColumnDef } from "@tanstack/react-table";

// Define columns inside the component or as a separate constant
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => {
      const manager = row.original;
      return (
        <Link href={`/dashboard/care-managers/${manager.care_manager_id}`} className="flex items-center gap-3 hover:underline">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{manager.full_name}</span>
            <span className="text-xs text-muted-foreground">{manager.email}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === 'active' ? 'default' : status === 'inactive' ? 'secondary' : 'destructive'}>
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "current_pets_count",
    header: "Load / Capacity",
    cell: ({ row }) => {
      const current = row.original.current_pets_count || 0;
      const max = row.original.max_pets || 50;
      const percentage = (current / max) * 100;
      
      return (
        <div className="flex flex-col gap-1 w-32">
          <div className="flex justify-between text-[10px]">
            <span>{current} / {max} pets</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-500 rounded-full" 
               style={{ width: `${Math.min(100, percentage)}%` }}
             />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "experience_years",
    header: "Experience",
    cell: ({ row }) => <span className="text-sm">{row.getValue("experience_years")} Years</span>,
  },
  {
    accessorKey: "average_satisfaction_score",
    header: "Rating",
    cell: ({ row }) => {
      const score = row.getValue("average_satisfaction_score") as number | null;
      return (
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{score ? score.toFixed(1) : "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "joined_date",
    header: "Joined",
    cell: ({ row }) => <span className="text-sm">{new Date(row.original.joined_date).toLocaleDateString()}</span>,
  },
];

export default function CareManagersPage() {
  const { data, isLoading } = useCareManagers();
  const careManagers = data?.data?.careManagers || [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Care Managers ({careManagers.length})</h1>
          <p className="text-muted-foreground">Manage dedicated care managers for Eternal tier pet parents.</p>
        </div>
        <Link href="/dashboard/care-managers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Care Manager
          </Button>
        </Link>
      </div>
      <div className="h-px bg-border w-full" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Managers</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{careManagers.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Assignments</h3>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {careManagers.reduce((acc: number, curr: any) => acc + (curr.current_pets_count || 0), 0)}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Avg Satisfaction</h3>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">4.8</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Capacity Utilization</h3>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">64%</div>
        </div>
      </div>

      <DataTable
        searchKey="full_name"
        columns={columns}
        data={careManagers}
        isLoading={isLoading}
      />
    </div>
  );
}
