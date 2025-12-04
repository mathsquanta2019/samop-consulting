"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  UserIcon,
  GraduationCapIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  MailIcon,
  CalendarIcon,
  XCircleIcon,
} from "@/components/icons"
import Link from "next/link"
import type { ApplicationFormData, DocumentType, AppointmentType } from "@/lib/types"
import {
  getApplicationFormById,
  reviewApplicationForm,
  requestMoreInformation,
  requestDocuments,
  sendEmailToClient,
  adminCreateAppointment,
  getAvailableSlots,
} from "@/lib/api"

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

type ReviewAction = "approve" | "reject" | "request_revision" | "request_documents" | "request_info"

interface ReviewHistoryItem {
  id: string
  action: string
  status: string
  comments: string
  reviewedBy: string
  reviewedAt: string
  details?: string[]
}

export default function ApplicationReviewPage() {
  const searchParams = useSearchParams()
  const formId = searchParams.get("id")

  const [form, setForm] = useState<ApplicationFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewComments, setReviewComments] = useState("")
  const [reviewAction, setReviewAction] = useState<ReviewAction>("request_revision")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Request Info Dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [requestedFields, setRequestedFields] = useState<string[]>([])
  const [infoComments, setInfoComments] = useState("")

  // Request Documents Dialog
  const [docsDialogOpen, setDocsDialogOpen] = useState(false)
  const [requestedDocs, setRequestedDocs] = useState<DocumentType[]>([])
  const [docsComments, setDocsComments] = useState("")

  // Email Dialog
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")

  // Meeting Dialog
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [meetingNotes, setMeetingNotes] = useState("")

  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([])

  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [meetingType, setMeetingType] = useState<AppointmentType>("consultation")

  const availableFields = [
    "Work Experience Details",
    "Education History Clarification",
    "Test Score Documentation",
    "Statement of Purpose Revision",
    "Financial Information",
    "Travel History",
    "Sponsor Details",
  ]

  const documentTypes: DocumentType[] = [
    "passport",
    "transcript",
    "diploma",
    "recommendation_letter",
    "statement_of_purpose",
    "cv_resume",
    "financial_statement",
    "english_proficiency",
    "birth_certificate",
    "police_clearance",
  ]

  useEffect(() => {
    if (formId) {
      loadForm(formId)
    }
  }, [formId])

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const handleMeetingDateChange = async (date: string) => {
    setMeetingDate(date)
    setMeetingTime("")
    if (date) {
      const result = await getAvailableSlots(date)
      if (result.success && result.data) {
        setAvailableSlots(result.data.map((slot) => slot.time))
      }
    }
  }

  const loadForm = async (id: string) => {
    setIsLoading(true)
    const result = await getApplicationFormById(id)
    if (result.success && result.data) {
      setForm(result.data)
      if (result.data.adminReview) {
        setReviewComments(result.data.adminReview.comments || "")
      }
    }
    setIsLoading(false)
  }

  // Initialize review history from existing reviews
  useEffect(() => {
    if (form?.adminReview) {
      setReviewHistory([
        {
          id: "1",
          action: "review",
          status: form.adminReview.status,
          comments: form.adminReview.comments,
          reviewedBy: form.adminReview.reviewedBy,
          reviewedAt: form.adminReview.reviewedAt,
        },
      ])
    }
  }, [form])

  const addToHistory = (item: Omit<ReviewHistoryItem, "id" | "reviewedAt" | "reviewedBy">) => {
    const newItem: ReviewHistoryItem = {
      ...item,
      id: Date.now().toString(),
      reviewedBy: "Admin User",
      reviewedAt: new Date().toISOString(),
    }
    setReviewHistory((prev) => [newItem, ...prev])
  }

  const handleReviewSubmit = async () => {
    if (!form) return

    setIsSubmitting(true)
    const newStatus = reviewAction === "approve" ? "approved" : reviewAction === "reject" ? "rejected" : "under_review"

    const result = await reviewApplicationForm(form.id, {
      status: newStatus,
      comments: reviewComments,
      reviewedBy: "Admin User",
    })

    if (result.success) {
      addToHistory({
        action: reviewAction,
        status: newStatus,
        comments: reviewComments,
      })
      setActionSuccess(
        reviewAction === "approve"
          ? "Application Approved!"
          : reviewAction === "reject"
            ? "Application Rejected"
            : "Revision Requested",
      )
      setReviewComments("")

      setTimeout(() => setActionSuccess(null), 3000)
    }
    setIsSubmitting(false)
  }

  const handleRequestInfo = async () => {
    if (!form || requestedFields.length === 0) return

    setIsSubmitting(true)
    const result = await requestMoreInformation(form.id, requestedFields, infoComments)

    if (result.success) {
      addToHistory({
        action: "request_info",
        status: "under_review",
        comments: infoComments,
        details: requestedFields,
      })
      setInfoDialogOpen(false)
      setRequestedFields([])
      setInfoComments("")
      setActionSuccess("Information request sent to client!")
      setTimeout(() => setActionSuccess(null), 3000)
    }
    setIsSubmitting(false)
  }

  const handleRequestDocuments = async () => {
    if (!form || requestedDocs.length === 0) return

    setIsSubmitting(true)
    const result = await requestDocuments(form.id, requestedDocs, docsComments)

    if (result.success) {
      addToHistory({
        action: "request_documents",
        status: "under_review",
        comments: docsComments,
        details: requestedDocs,
      })
      setDocsDialogOpen(false)
      setRequestedDocs([])
      setDocsComments("")
      setActionSuccess("Document request sent to client!")
      setTimeout(() => setActionSuccess(null), 3000)
    }
    setIsSubmitting(false)
  }

  const handleSendEmail = async () => {
    if (!form || !emailSubject || !emailBody) return

    setIsSubmitting(true)
    const result = await sendEmailToClient({
      clientId: form.clientId,
      subject: emailSubject,
      body: emailBody,
      applicationId: form.id,
    })

    if (result.success) {
      addToHistory({
        action: "email_sent",
        status: form.status,
        comments: `Subject: ${emailSubject}`,
      })
      setEmailDialogOpen(false)
      setEmailSubject("")
      setEmailBody("")
      setActionSuccess("Email sent to client!")
      setTimeout(() => setActionSuccess(null), 3000)
    }
    setIsSubmitting(false)
  }

  const handleScheduleMeeting = async () => {
    if (!form || !meetingDate || !meetingTime) return

    setIsSubmitting(true)
    const result = await adminCreateAppointment({
      clientId: form.clientId,
      clientName: `${form.personalInfo.firstName} ${form.personalInfo.lastName}`,
      clientEmail: form.personalInfo.email,
      clientPhone: form.personalInfo.phone,
      type: meetingType,
      date: meetingDate,
      time: meetingTime,
      duration: 60,
      notes: meetingNotes,
    })

    if (result.success) {
      addToHistory({
        action: "meeting_scheduled",
        status: form.status,
        comments: `Meeting scheduled for ${meetingDate} at ${meetingTime}`,
      })
      setMeetingDialogOpen(false)
      setMeetingDate("")
      setMeetingTime("")
      setMeetingNotes("")
      setActionSuccess("Meeting scheduled successfully!")
      setTimeout(() => setActionSuccess(null), 3000)
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found.</p>
        <Link href="/admin/applications">
          <Button variant="outline" className="mt-4 bg-transparent">
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <span className="font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/applications">
            <Button variant="ghost" size="icon">
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Review</h1>
            <p className="text-muted-foreground">
              {form.personalInfo.firstName} {form.personalInfo.lastName} - {form.serviceType.toUpperCase()}
            </p>
          </div>
        </div>
        <Badge className={statusColors[form.status] || statusColors.draft}>
          {form.status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserIcon className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground text-xs">Full Name</Label>
                      <p className="font-medium">
                        {form.personalInfo.firstName} {form.personalInfo.middleName} {form.personalInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Email</Label>
                      <p className="font-medium">{form.personalInfo.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Phone</Label>
                      <p className="font-medium">{form.personalInfo.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Date of Birth</Label>
                      <p className="font-medium">{form.personalInfo.dateOfBirth}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Nationality</Label>
                      <p className="font-medium">{form.personalInfo.nationality}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Country of Residence</Label>
                      <p className="font-medium">{form.personalInfo.countryOfResidence}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground text-xs">Address</Label>
                      <p className="font-medium">
                        {form.personalInfo.address}, {form.personalInfo.city}, {form.personalInfo.state}{" "}
                        {form.personalInfo.postalCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCapIcon className="h-5 w-5" />
                    Education History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {form.educationHistory.length === 0 ? (
                    <p className="text-muted-foreground">No education records provided.</p>
                  ) : (
                    <div className="space-y-4">
                      {form.educationHistory.map((edu) => (
                        <div key={edu.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{edu.institution}</p>
                              <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {edu.level.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Country:</span> {edu.country}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span> {edu.startDate} - {edu.endDate}
                            </div>
                            {edu.gpa && (
                              <div>
                                <span className="text-muted-foreground">GPA:</span> {edu.gpa}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {form.workExperience && form.workExperience.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {form.workExperience.map((work) => (
                        <div key={work.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{work.position}</p>
                              <p className="text-sm text-muted-foreground">{work.companyName}</p>
                            </div>
                            {work.isCurrent && <Badge className="bg-green-100 text-green-700">Current</Badge>}
                          </div>
                          <div className="text-sm">
                            <p>
                              <span className="text-muted-foreground">Location:</span> {work.country}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Duration:</span> {work.startDate} -{" "}
                              {work.isCurrent ? "Present" : work.endDate}
                            </p>
                            {work.responsibilities && (
                              <p className="mt-2">
                                <span className="text-muted-foreground">Responsibilities:</span> {work.responsibilities}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {form.testScores && form.testScores.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Test Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {form.testScores.map((test, index) => (
                        <div key={index} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="uppercase">
                              {test.testType}
                            </Badge>
                            <span className="text-2xl font-bold text-primary">{test.overallScore}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Taken: {test.datesTaken}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileTextIcon className="h-5 w-5" />
                    Required Documents
                  </CardTitle>
                  <CardDescription>Review uploaded documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {form.requiredDocuments.map((doc) => (
                      <div
                        key={doc.type}
                        className={`p-4 rounded-lg border ${
                          doc.uploaded ? "border-green-200 bg-green-50" : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {doc.uploaded ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium capitalize">{doc.type.replace(/_/g, " ")}</p>
                              <p className="text-xs text-muted-foreground">{doc.required ? "Required" : "Optional"}</p>
                            </div>
                          </div>
                          {doc.uploaded ? (
                            <Badge className="bg-green-100 text-green-700">Uploaded</Badge>
                          ) : (
                            <Badge variant="secondary">Not Uploaded</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Program Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Preferred Countries</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {form.preferredCountries.map((country) => (
                        <Badge key={country} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {form.preferredInstitutions && form.preferredInstitutions.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Preferred Institutions</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.preferredInstitutions.map((inst) => (
                          <Badge key={inst} variant="outline">
                            {inst}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground text-xs">Intake Preference</Label>
                    <p className="font-medium">{form.intakePreference || "Not specified"}</p>
                  </div>
                </CardContent>
              </Card>

              {form.statementOfPurpose && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Statement of Purpose</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{form.statementOfPurpose}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Review Panel */}
        <div className="space-y-4">
          <Card className="bg-card sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="h-5 w-5" />
                Review Actions
              </CardTitle>
              <CardDescription>Take action on this application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={reviewAction} onValueChange={(v) => setReviewAction(v as ReviewAction)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        Approve Application
                      </div>
                    </SelectItem>
                    <SelectItem value="reject">
                      <div className="flex items-center gap-2">
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                        Reject Application
                      </div>
                    </SelectItem>
                    <SelectItem value="request_revision">
                      <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-4 w-4 text-orange-600" />
                        Request Revisions
                      </div>
                    </SelectItem>
                    <SelectItem value="request_documents">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-blue-600" />
                        Request Documents
                      </div>
                    </SelectItem>
                    <SelectItem value="request_info">
                      <div className="flex items-center gap-2">
                        <MessageSquareIcon className="h-4 w-4 text-purple-600" />
                        Request Information
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add your review comments here..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleReviewSubmit}
                disabled={isSubmitting || !reviewComments}
                className="w-full bg-primary text-primary-foreground"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>

              <div className="pt-4 border-t border-border space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setInfoDialogOpen(true)
                  }}
                >
                  <MessageSquareIcon className="mr-2 h-4 w-4" />
                  Request More Info
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setDocsDialogOpen(true)
                  }}
                >
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Request Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setEmailSubject(`Update on your ${form.serviceType} application`)
                    setEmailDialogOpen(true)
                  }}
                >
                  <MailIcon className="mr-2 h-4 w-4" />
                  Email Client
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setMeetingDialogOpen(true)
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Review History */}
          {form.adminReview && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Review History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <Label className="text-muted-foreground text-xs">Reviewed By</Label>
                    <p>{form.adminReview.reviewedBy}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Reviewed At</Label>
                    <p>{new Date(form.adminReview.reviewedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge className={statusColors[form.adminReview.status] || "bg-gray-100 text-gray-700"}>
                      {form.adminReview.status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Comments</Label>
                    <p className="text-muted-foreground">{form.adminReview.comments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Complete history of actions taken</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

                  <div className="space-y-4">
                    {reviewHistory.map((item, index) => (
                      <div key={item.id} className="relative pl-8">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ${
                            item.action === "approve"
                              ? "bg-green-100"
                              : item.action === "reject"
                                ? "bg-red-100"
                                : item.action === "email_sent"
                                  ? "bg-blue-100"
                                  : item.action === "meeting_scheduled"
                                    ? "bg-purple-100"
                                    : "bg-yellow-100"
                          }`}
                        >
                          {item.action === "approve" && <CheckCircleIcon className="h-3.5 w-3.5 text-green-600" />}
                          {item.action === "reject" && <XCircleIcon className="h-3.5 w-3.5 text-red-600" />}
                          {item.action === "request_info" && (
                            <MessageSquareIcon className="h-3.5 w-3.5 text-yellow-600" />
                          )}
                          {item.action === "request_documents" && (
                            <FileTextIcon className="h-3.5 w-3.5 text-yellow-600" />
                          )}
                          {item.action === "email_sent" && <MailIcon className="h-3.5 w-3.5 text-blue-600" />}
                          {item.action === "meeting_scheduled" && (
                            <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
                          )}
                          {item.action === "review" && <ClockIcon className="h-3.5 w-3.5 text-yellow-600" />}
                        </div>

                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm capitalize">{item.action.replace(/_/g, " ")}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.status === "approved"
                                  ? "border-green-300 text-green-700"
                                  : item.status === "rejected"
                                    ? "border-red-300 text-red-700"
                                    : "border-yellow-300 text-yellow-700"
                              }`}
                            >
                              {item.status.replace(/_/g, " ")}
                            </Badge>
                          </div>

                          {item.comments && <p className="text-sm text-muted-foreground mb-2">{item.comments}</p>}

                          {item.details && item.details.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.details.map((detail, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {detail}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.reviewedBy}</span>
                            <span>{new Date(item.reviewedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Information Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Request More Information</DialogTitle>
            <DialogDescription>Select the fields that need additional information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {availableFields.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={requestedFields.includes(field)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setRequestedFields([...requestedFields, field])
                      } else {
                        setRequestedFields(requestedFields.filter((f) => f !== field))
                      }
                    }}
                  />
                  <label htmlFor={field} className="text-sm font-medium leading-none cursor-pointer">
                    {field}
                  </label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Additional Comments</Label>
              <Textarea
                value={infoComments}
                onChange={(e) => setInfoComments(e.target.value)}
                placeholder="Explain what information is needed..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setInfoDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRequestInfo}
                className="flex-1 bg-primary text-primary-foreground"
                disabled={requestedFields.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Documents Dialog */}
      <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Request Documents</DialogTitle>
            <DialogDescription>Select the documents that need to be uploaded</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {documentTypes.map((docType) => (
                <div key={docType} className="flex items-center space-x-2">
                  <Checkbox
                    id={docType}
                    checked={requestedDocs.includes(docType)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setRequestedDocs([...requestedDocs, docType])
                      } else {
                        setRequestedDocs(requestedDocs.filter((d) => d !== docType))
                      }
                    }}
                  />
                  <label htmlFor={docType} className="text-sm font-medium leading-none cursor-pointer capitalize">
                    {docType.replace(/_/g, " ")}
                  </label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Additional Instructions</Label>
              <Textarea
                value={docsComments}
                onChange={(e) => setDocsComments(e.target.value)}
                placeholder="Provide specific instructions for document upload..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setDocsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRequestDocuments}
                className="flex-1 bg-primary text-primary-foreground"
                disabled={requestedDocs.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Email Client</DialogTitle>
            <DialogDescription>Send an email to {form.personalInfo.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your message to the client..."
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
                {isSubmitting ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Schedule Meeting</DialogTitle>
            <DialogDescription>Schedule a meeting with the client to discuss their application.</DialogDescription>
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
                  onChange={(e) => handleMeetingDateChange(e.target.value)}
                  min={getTodayDate()}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={meetingTime} onValueChange={setMeetingTime} disabled={!meetingDate}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={meetingDate ? "Select time" : "Select date first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No slots available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meeting Notes (Optional)</Label>
              <Textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Agenda or notes for the meeting..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setMeetingDialogOpen(false)}>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
