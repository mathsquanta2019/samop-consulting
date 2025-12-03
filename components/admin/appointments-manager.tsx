"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CalendarIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  EyeIcon,
  EditIcon,
} from "@/components/icons"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { updateAppointmentStatus, proposeNewAppointmentTime, cancelAppointment } from "@/lib/api"

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
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusUpdate = async (id: string, status: AppointmentStatus) => {
    const result = await updateAppointmentStatus(id, status)
    if (result.success) {
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)))
    }
  }

  const handleProposeNewTime = async () => {
    if (!selectedApt || !newDate || !newTime) return

    setIsSubmitting(true)
    const result = await proposeNewAppointmentTime(selectedApt.id, newDate, newTime, reason)
    if (result.success) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedApt.id ? { ...apt, status: "rescheduled", date: newDate, time: newTime } : apt,
        ),
      )
      setRescheduleDialogOpen(false)
      setSelectedApt(null)
      setNewDate("")
      setNewTime("")
      setReason("")
    }
    setIsSubmitting(false)
  }

  const handleCancelAppointment = async () => {
    if (!selectedApt) return

    setIsSubmitting(true)
    const result = await cancelAppointment(selectedApt.id, reason)
    if (result.success) {
      setAppointments((prev) => prev.map((apt) => (apt.id === selectedApt.id ? { ...apt, status: "cancelled" } : apt)))
      setCancelDialogOpen(false)
      setSelectedApt(null)
      setReason("")
    }
    setIsSubmitting(false)
  }

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "clientName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Client
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.clientName}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MailIcon className="h-3 w-3" />
              {row.original.clientEmail}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <PhoneIcon className="h-3 w-3" />
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
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            {new Date(row.original.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 text-sm">
            <ClockIcon className="h-3 w-3 text-muted-foreground" />
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
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedApt(apt)
                  setViewDialogOpen(true)
                }}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {apt.status === "scheduled" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusUpdate(apt.id, "completed")} className="text-green-600">
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedApt(apt)
                      setNewDate(apt.date)
                      setRescheduleDialogOpen(true)
                    }}
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    Propose New Time
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedApt(apt)
                      setCancelDialogOpen(true)
                    }}
                    className="text-red-600"
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedApt && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Client Name</Label>
                  <p className="font-medium">{selectedApt.clientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={statusColors[selectedApt.status]}>{selectedApt.status}</Badge>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedApt.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{selectedApt.clientPhone}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p>
                    {new Date(selectedApt.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p>{selectedApt.time}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="capitalize">{selectedApt.type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p>{selectedApt.duration} minutes</p>
                </div>
              </div>
              {selectedApt.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="p-3 bg-muted rounded-lg">{selectedApt.notes}</p>
                </div>
              )}
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Propose New Time</DialogTitle>
            <DialogDescription>Suggest a new date and time for this appointment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>New Time</Label>
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for Rescheduling</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you're proposing a new time..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setRescheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProposeNewTime}
                className="flex-1 bg-primary text-primary-foreground"
                disabled={!newDate || !newTime || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Proposal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Cancel Appointment</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this appointment?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Cancellation</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for cancellation..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setCancelDialogOpen(false)}>
                Keep Appointment
              </Button>
              <Button
                onClick={handleCancelAppointment}
                variant="destructive"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
