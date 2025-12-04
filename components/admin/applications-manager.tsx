"use client"

import { useState } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  SendIcon,
  BellIcon,
} from "@/components/icons"
import type { Application, ApplicationStatus, AppointmentType } from "@/lib/types"
import {
  updateApplicationStatus,
  sendEmailToClient,
  adminCreateAppointment,
  getAvailableSlots,
  sendApplicationReminder,
} from "@/lib/api"

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

export function ApplicationsManager({ applications: initialApplications }: ApplicationsManagerProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [newStatus, setNewStatus] = useState<ApplicationStatus | "">("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [emailApp, setEmailApp] = useState<Application | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)

  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [meetingApp, setMeetingApp] = useState<Application | null>(null)
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [meetingType, setMeetingType] = useState<AppointmentType>("consultation")
  const [meetingDuration, setMeetingDuration] = useState("60")
  const [meetingNotes, setMeetingNotes] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [meetingSuccess, setMeetingSuccess] = useState(false)

  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [reminderApp, setReminderApp] = useState<Application | null>(null)
  const [reminderMessage, setReminderMessage] = useState("")
  const [reminderType, setReminderType] = useState<"incomplete" | "documents" | "deadline">("incomplete")
  const [reminderSuccess, setReminderSuccess] = useState(false)

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return

    setIsSubmitting(true)
    const result = await updateApplicationStatus(selectedApp.id, newStatus, notes)

    if (result.success) {
      setApplications((prev) => prev.map((app) => (app.id === selectedApp.id ? { ...app, status: newStatus } : app)))
      setIsSuccess(true)
      setTimeout(() => {
        setSelectedApp(null)
        setNewStatus("")
        setNotes("")
        setIsSuccess(false)
      }, 2000)
    }
    setIsSubmitting(false)
  }

  const handleSendEmail = async () => {
    if (!emailApp || !emailSubject || !emailBody) return

    setIsSubmitting(true)
    const result = await sendEmailToClient({
      clientId: emailApp.clientId,
      subject: emailSubject,
      body: emailBody,
      applicationId: emailApp.id,
    })

    if (result.success) {
      setEmailSuccess(true)
      setTimeout(() => {
        setEmailDialogOpen(false)
        setEmailSubject("")
        setEmailBody("")
        setEmailApp(null)
        setEmailSuccess(false)
      }, 2000)
    }
    setIsSubmitting(false)
  }

  const handleDateChange = async (date: string) => {
    setMeetingDate(date)
    setMeetingTime("") // Reset time when date changes
    if (date) {
      const result = await getAvailableSlots(date)
      if (result.success && result.data) {
        // Filter to only get times that are available
        const times = result.data.filter((slot) => slot.available).map((slot) => slot.time)
        setAvailableSlots(times)
      }
    }
  }

  const handleScheduleMeeting = async () => {
    if (!meetingApp || !meetingDate || !meetingTime) return

    setIsSubmitting(true)
    const result = await adminCreateAppointment({
      clientId: meetingApp.clientId,
      clientName: `Client ${meetingApp.clientId.slice(-6)}`,
      clientEmail: "",
      clientPhone: "",
      type: meetingType,
      date: meetingDate,
      time: meetingTime,
      duration: Number.parseInt(meetingDuration),
      notes: meetingNotes,
    })

    if (result.success) {
      setMeetingSuccess(true)
      setTimeout(() => {
        setMeetingDialogOpen(false)
        setMeetingApp(null)
        setMeetingDate("")
        setMeetingTime("")
        setMeetingNotes("")
        setMeetingSuccess(false)
      }, 2000)
    }
    setIsSubmitting(false)
  }

  const handleSendReminder = async () => {
    if (!reminderApp || !reminderMessage) return

    setIsSubmitting(true)
    const result = await sendApplicationReminder({
      applicationId: reminderApp.id,
      clientId: reminderApp.clientId,
      clientEmail: reminderApp.clientEmail || "client@example.com",
      message: reminderMessage,
      reminderType,
    })

    if (result.success) {
      setReminderSuccess(true)
      setTimeout(() => {
        setReminderDialogOpen(false)
        setReminderMessage("")
        setReminderApp(null)
        setReminderSuccess(false)
      }, 2000)
    }
    setIsSubmitting(false)
  }

  const getStatusColor = (status: ApplicationStatus) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700"
  }

  const filterApplicationsByTab = (apps: Application[], tab: string) => {
    switch (tab) {
      case "pending":
        return apps.filter((a) => a.status === "pending" || a.status === "documents_required")
      case "review":
        return apps.filter((a) => a.status === "under_review" || a.status === "submitted")
      case "completed":
        return apps.filter((a) => a.status === "approved" || a.status === "completed" || a.status === "rejected").length
      default:
        return apps
    }
  }

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
      cell: ({ row }) => {
        const app = row.original
        const reminderTypes = getReminderTypes(app.status)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/applications/review?id=${app.id}`}>
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Review Application
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedApp(app)
                  setNewStatus("")
                }}
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEmailApp(app)
                  setEmailDialogOpen(true)
                }}
              >
                <MailIcon className="mr-2 h-4 w-4" />
                Email Client
              </DropdownMenuItem>
              {canSendReminder(app.status) && reminderTypes.length > 0 && (
                <DropdownMenuItem
                  onClick={() => {
                    setReminderApp(app)
                    setReminderType(reminderTypes[0].value as typeof reminderType)
                    setReminderDialogOpen(true)
                  }}
                >
                  <BellIcon className="mr-2 h-4 w-4" />
                  Send Reminder
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setMeetingApp(app)
                  setMeetingDialogOpen(true)
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule Meeting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const filteredApplications = filterApplicationsByTab(applications, activeTab)

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const getReminderTypes = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
      case "draft":
        return [
          { value: "incomplete", label: "Complete Application" },
          { value: "documents", label: "Submit Documents" },
        ]
      case "documents_required":
        return [
          { value: "documents", label: "Missing Documents" },
          { value: "deadline", label: "Document Deadline" },
        ]
      case "under_review":
        return [{ value: "info", label: "Additional Information Needed" }]
      case "interview_scheduled":
        return [
          { value: "meeting", label: "Upcoming Interview" },
          { value: "preparation", label: "Interview Preparation" },
        ]
      default:
        return []
    }
  }

  const canSendReminder = (status: ApplicationStatus) => {
    return !["approved", "rejected", "completed"].includes(status)
  }

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

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          {emailSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center text-card-foreground">Email Sent Successfully!</DialogTitle>
                <DialogDescription className="text-center mt-2">
                  Your email has been sent to the client.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Email Client</DialogTitle>
                <DialogDescription>Send an email to the client about their application.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your message..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={!emailSubject || !emailBody || isSubmitting}
                  >
                    <SendIcon className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          {meetingSuccess ? (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center text-card-foreground">Meeting Scheduled!</DialogTitle>
                <DialogDescription className="text-center mt-2">
                  The meeting has been scheduled for {meetingDate} at {meetingTime}.
                  <br />A notification has been sent to the client.
                </DialogDescription>
              </DialogHeader>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Schedule Meeting</DialogTitle>
                <DialogDescription>Schedule a meeting with the client.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Meeting Type</Label>
                  <Select value={meetingType} onValueChange={(v) => setMeetingType(v as AppointmentType)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="document_review">Document Review</SelectItem>
                      <SelectItem value="interview_prep">Interview Prep</SelectItem>
                      <SelectItem value="visa_guidance">Visa Guidance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={getTodayDate()}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select
                      value={meetingTime}
                      onValueChange={setMeetingTime}
                      disabled={!meetingDate || availableSlots.length === 0}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          placeholder={
                            !meetingDate
                              ? "Select date first"
                              : availableSlots.length === 0
                                ? "No slots available"
                                : "Select time"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={meetingDuration} onValueChange={setMeetingDuration}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Meeting agenda or notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setMeetingDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleMeeting}
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={!meetingDate || !meetingTime || isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          {reminderSuccess ? (
            <div className="py-8 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-card-foreground">Reminder Sent!</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Send Application Reminder</DialogTitle>
                <DialogDescription>
                  Send a reminder to {reminderApp?.clientName || "the client"} about their application.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Reminder Type</Label>
                  <Select value={reminderType} onValueChange={(v) => setReminderType(v as typeof reminderType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderApp &&
                        getReminderTypes(reminderApp.status).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Write your reminder message..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setReminderDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendReminder}
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={!reminderMessage || isSubmitting}
                  >
                    <BellIcon className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Reminder"}
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
