"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import { Edit, CheckCircle, ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Application, ApplicationStatus } from "@/lib/types"
import { updateApplicationStatus } from "@/lib/api"

interface ApplicationsManagerProps {
  applications: Application[]
}

const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "documents_required", label: "Documents Required", color: "bg-orange-100 text-orange-700" },
  { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-700" },
  { value: "submitted", label: "Submitted", color: "bg-indigo-100 text-indigo-700" },
  { value: "interview_scheduled", label: "Interview Scheduled", color: "bg-purple-100 text-purple-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "completed", label: "Completed", color: "bg-green-200 text-green-800" },
]

export function ApplicationsManager({ applications }: ApplicationsManagerProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [newStatus, setNewStatus] = useState<ApplicationStatus | "">("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return

    setIsSubmitting(true)
    const result = await updateApplicationStatus(selectedApp.id, newStatus, notes)

    if (result.success) {
      setIsSuccess(true)
      setTimeout(() => {
        setSelectedApp(null)
        setNewStatus("")
        setNotes("")
        setIsSuccess(false)
      }, 1500)
    }
    setIsSubmitting(false)
  }

  const getStatusColor = (status: ApplicationStatus) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700"
  }

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "institution",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Application
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.institution || "N/A"}</p>
          <p className="text-sm text-muted-foreground">{row.original.program || row.original.serviceType}</p>
        </div>
      ),
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
      cell: ({ row }) => <span className="capitalize">{row.getValue<string>("serviceType").replace("_", " ")}</span>,
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      accessorKey: "country",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Country
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<ApplicationStatus>("status")
        return <Badge className={getStatusColor(status)}>{statusOptions.find((s) => s.value === status)?.label}</Badge>
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.getValue<string>("updatedAt")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
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
            <DropdownMenuItem
              onClick={() => {
                setSelectedApp(row.original)
                setNewStatus(row.original.status)
                setNotes(row.original.notes)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Applications Management</h1>
        <p className="text-muted-foreground">Review and update application status for all clients.</p>
      </div>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={applications}
            searchPlaceholder="Search applications..."
            exportFilename="samop-applications"
            filterColumns={[
              {
                key: "serviceType",
                label: "Service",
                options: [
                  { value: "education", label: "Education" },
                  { value: "immigration", label: "Immigration" },
                  { value: "sevis", label: "SEVIS" },
                  { value: "credential_evaluation", label: "Credential Eval" },
                ],
              },
              {
                key: "status",
                label: "Status",
                options: statusOptions.map((s) => ({ value: s.value, label: s.label })),
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="bg-card">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Status Updated!</h3>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Update Application Status</DialogTitle>
                <DialogDescription>
                  {selectedApp?.institution || selectedApp?.serviceType} - {selectedApp?.country}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>New Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this status update..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleUpdateStatus}
                  className="w-full bg-primary text-primary-foreground"
                  disabled={!newStatus || isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
