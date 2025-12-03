"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Calendar, Clock, Mail, Phone, Check, X, ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { updateAppointmentStatus } from "@/lib/api"

interface AppointmentsManagerProps {
  appointments: Appointment[]
}

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-yellow-100 text-yellow-700",
}

export function AppointmentsManager({ appointments: initialAppointments }: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState(initialAppointments)

  const handleStatusUpdate = async (id: string, status: AppointmentStatus) => {
    const result = await updateAppointmentStatus(id, status)
    if (result.success) {
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)))
    }
  }

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "clientName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.clientName}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {row.original.clientEmail}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {row.original.clientPhone}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span className="capitalize">{row.getValue<string>("type").replace(/_/g, " ")}</span>,
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {new Date(row.original.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {row.original.time}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => <span>{row.getValue<number>("duration")} min</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<AppointmentStatus>("status")
        return <Badge className={statusColors[status]}>{status}</Badge>
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const apt = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {apt.status === "scheduled" && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, "completed")} className="text-green-600">
                    <Check className="mr-2 h-4 w-4" />
                    Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, "cancelled")} className="text-red-600">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appointments Management</h1>
        <p className="text-muted-foreground">View and manage all scheduled appointments.</p>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={appointments}
            searchPlaceholder="Search by client name or email..."
            exportFilename="samop-appointments"
            filterColumns={[
              {
                key: "type",
                label: "Type",
                options: [
                  { value: "consultation", label: "Consultation" },
                  { value: "document_review", label: "Document Review" },
                  { value: "interview_prep", label: "Interview Prep" },
                  { value: "visa_guidance", label: "Visa Guidance" },
                ],
              },
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "scheduled", label: "Scheduled" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "rescheduled", label: "Rescheduled" },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
