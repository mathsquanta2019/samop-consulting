"use client"

import { useState } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  EditIcon,
  CheckCircleIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  EyeIcon,
  ClockIcon,
  AlertCircleIcon,
  FileTextIcon,
  UserIcon,
  MailIcon,
  CalendarIcon,
} from "@/components/icons"
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
  const [activeTab, setActiveTab] = useState("all")

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

  // Filter applications based on tab
  const filterApplicationsByTab = (apps: Application[], tab: string) => {
    switch (tab) {
      case "pending":
        return apps.filter((a) => a.status === "pending" || a.status === "documents_required")
      case "review":
        return apps.filter((a) => a.status === "under_review" || a.status === "submitted")
      case "completed":
        return apps.filter((a) => a.status === "approved" || a.status === "completed" || a.status === "rejected")
      default:
        return apps
    }
  }

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending" || a.status === "documents_required").length,
    inReview: applications.filter((a) => a.status === "under_review" || a.status === "submitted").length,
    completed: applications.filter(
      (a) => a.status === "approved" || a.status === "completed" || a.status === "rejected",
    ).length,
  }

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "institution",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Application
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
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
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm">Client #{row.original.clientId?.slice(-6) || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue<string>("serviceType").replace("_", " ")}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      accessorKey: "country",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Country
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
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
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
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
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/applications/review?id=${row.original.id}`}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Review Application
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/clients?id=${row.original.clientId}`}>
                <UserIcon className="mr-2 h-4 w-4" />
                View Client
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedApp(row.original)
                setNewStatus(row.original.status)
                setNotes(row.original.notes)
              }}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MailIcon className="mr-2 h-4 w-4" />
              Email Client
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Meeting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const filteredApplications = filterApplicationsByTab(applications, activeTab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Applications Management</h1>
        <p className="text-muted-foreground">Review and process all client applications.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="bg-card cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setActiveTab("all")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <FileTextIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-card cursor-pointer hover:border-yellow-500/50 transition-colors"
          onClick={() => setActiveTab("pending")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Action</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-card cursor-pointer hover:border-blue-500/50 transition-colors"
          onClick={() => setActiveTab("review")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.inReview}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-card cursor-pointer hover:border-green-500/50 transition-colors"
          onClick={() => setActiveTab("completed")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed View */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {stats.pending > 0 && (
              <span className="ml-2 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
                {stats.pending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="review">Under Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={filteredApplications}
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
        </TabsContent>
      </Tabs>

      {/* Update Status Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="bg-card">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
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
                  <Label>Notes (visible to client)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this status update..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    These notes will be visible to the client in their dashboard.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedApp(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={!newStatus || isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
